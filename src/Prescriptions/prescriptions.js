import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_Firebase_API_Key,
  authDomain: "quad-core-a.firebaseapp.com",
  projectId: "quad-core-a",
  storageBucket: "quad-core-a.firebasestorage.app",
  messagingSenderId: "702554879008",
  appId: "1:702554879008:web:c502334c89adb58f8f3845",
  measurementId: "G-L8ZCNH62LF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const GEMINI_API_KEY = import.meta.env.VITE_Gemni_API_Key;
const fileInput = document.getElementById("prescriptionFile");
const fileNameText = document.getElementById("fileName");
const uploadBtn = document.getElementById("uploadBtn");

// Legacy inputs (for backward compatibility if needed)
const nameInput = document.getElementById("prescriptionName");
const doctorInput = document.getElementById("doctorName");
const dateInput = document.getElementById("prescribedDate");

let extractedPrescription = null;
let editedFields = {};

const prescriptionSection = document.getElementById("prescriptionSection");
const prescriptionContainer = document.getElementById("prescriptionContainer");

// Auth state monitoring
auth.onAuthStateChanged(user => {
  if (user) {
    fetchPastPrescriptions();
  }
});

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

/*********************************
 * STATE
 *********************************/
let prescriptions = JSON.parse(localStorage.getItem("prescriptions")) || [];

/*********************************
 * LOAD
 *********************************/
window.addEventListener("DOMContentLoaded", () => {
  renderPrescriptions();

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
});

/*********************************
 * FILE → BASE64
 *********************************/
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/*********************************
 * GEMINI IMAGE EXTRACTION
 *********************************/
async function extractPrescriptionFromImage(file) {
  const base64Image = await fileToBase64(file);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [
            {
              text: `
You are a medical document parser.

Extract prescription details from the image.

CRITICAL DATE RULES (MANDATORY):
- Assume dates are written in Indian format: DD/MM/YY
- Convert the date to the format: YYYY-MM-DD
- If DD/MM/YY is invalid (e.g., day > 31 or month > 12),
  then interpret the date as MM/DD/YY and convert to YYYY-MM-DD
  - If the date is still invalid or ambiguous, return null

Rules:
- Do NOT diagnose
- Do NOT add assumptions
- If data is missing, return null
- Output ONLY valid JSON in EXACT format:

{
  "patient_name": "",
  "doctor_name": "",
  "date": "",
  "medicines": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "duration": ""
    }
  ]
}
`
            },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Image
              }
            }
          ]
        }]
      })
    }
  );

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Gemini returned empty response");
  
  return extractJson(text);
}

/*********************************
 * FILE CHANGE → AUTO EXTRACT
 *********************************/
fileInput.addEventListener("change", async () => {
  if (!fileInput.files[0]) {
    fileNameText.textContent = "No file chosen";
    return;
  }

  fileNameText.textContent = fileInput.files[0].name;

  try {
    uploadBtn.disabled = true;
    uploadBtn.textContent = "Reading prescription...";

    const extracted = await extractPrescriptionFromImage(fileInput.files[0]);
    extractedPrescription = extracted;

    // Render auto-detected data for review
    renderAutoDetected(extracted);

    // Also populate legacy inputs if they exist (backward compatibility)
    if (nameInput && extracted.patient_name)
      nameInput.value = extracted.patient_name;

    if (doctorInput && extracted.doctor_name)
      doctorInput.value = extracted.doctor_name;

    if (dateInput && extracted.date)
      dateInput.value = extracted.date;

    console.log("Extracted medicines:", extracted.medicines);

  } catch (err) {
    console.error(err);
    alert("Could not extract prescription details.");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload";
  }
});

/*********************************
 * RENDER AUTO-DETECTED DATA
 *********************************/
function renderAutoDetected(data) {
  const autoDetectedSection = document.getElementById("autoDetectedSection");
  if (autoDetectedSection) {
    autoDetectedSection.style.display = "block";
  }

  const detDoctor = document.getElementById("detDoctor");
  const detDate = document.getElementById("detDate");

  if (detDoctor) detDoctor.value = data.doctor_name || "";
  if (detDate) detDate.value = data.date || "";

  const tbody = document.getElementById("medicinesBody");
  if (tbody) {
    tbody.innerHTML = "";

    data.medicines.forEach((med) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><input type="text" value="${med.name || ""}" /></td>
        <td><input type="text" value="${med.dosage || ""}" /></td>
        <td><input type="text" value="${med.frequency || ""}" /></td>
        <td><input type="text" value="${med.duration || ""}" /></td>
      `;

      tbody.appendChild(tr);
    });
  }
}

/*********************************
 * COLLECT MEDICINES FROM TABLE
 *********************************/
function collectMedicinesFromTable() {
  const rows = document.querySelectorAll("#medicinesBody tr");

  return Array.from(rows).map(row => {
    const inputs = row.querySelectorAll("input");

    return {
      name: inputs[0].value.trim() || null,
      dosage: inputs[1].value.trim() || null,
      frequency: inputs[2].value.trim() || null,
      duration: inputs[3].value.trim() || null
    };
  });
}

/*********************************
 * UPLOAD TO FIRESTORE
 *********************************/
uploadBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  
  if (!user) {
    alert("Please log in first.");
    return;
  }

  // Check if we have the modern UI elements
  const detDoctor = document.getElementById("detDoctor");
  const detDate = document.getElementById("detDate");
  const medicinesBody = document.getElementById("medicinesBody");

  let finalData;

  // Use modern editable table if available
  if (detDoctor && detDate && medicinesBody) {
    if (!detDoctor.value || !detDate.value) {
      alert("Please fill in doctor name and date.");
      return;
    }

    finalData = {
      doctorName: detDoctor.value || null,
      date: detDate.value || null,
      medicines: collectMedicinesFromTable()
    };
  } 
  // Fallback to legacy inputs
  else if (nameInput && doctorInput && dateInput) {
    if (!fileInput.files[0] || !nameInput.value || !doctorInput.value || !dateInput.value) {
      alert("Please fill all fields.");
      return;
    }

    // If we have extracted prescription data, use that
    finalData = {
      doctorName: doctorInput.value,
      date: dateInput.value,
      medicines: extractedPrescription?.medicines || []
    };

    // Also save to localStorage for backward compatibility
    prescriptions.push({
      id: Date.now(),
      name: nameInput.value,
      doctor: doctorInput.value,
      date: dateInput.value,
      fileName: fileInput.files[0].name
    });
    localStorage.setItem("prescriptions", JSON.stringify(prescriptions));
  } 
  else {
    alert("UI elements not found. Please check your HTML.");
    return;
  }

  try {
    // Save to Firestore
    await addDoc(
      collection(db, "users", user.uid, "prescriptions"),
      finalData
    );

    console.log("Prescription saved successfully to Firestore");

    // Reset UI
    resetUploadUI();

    // Refresh prescriptions list
    await fetchPastPrescriptions();
    
    alert("Prescription saved successfully!");

  } catch (error) {
    console.error("Error saving prescription:", error);
    alert("Failed to save prescription. Please try again.");
  }
});

/*********************************
 * RESET UPLOAD UI
 *********************************/
function resetUploadUI() {
  const uploadFlow = document.getElementById("uploadFlow");
  const autoDetectedSection = document.getElementById("autoDetectedSection");

  if (uploadFlow) uploadFlow.style.display = "none";
  if (autoDetectedSection) autoDetectedSection.style.display = "none";

  fileInput.value = "";
  fileNameText.textContent = "No file chosen";

  // Clear legacy inputs if they exist
  if (nameInput) nameInput.value = "";
  if (doctorInput) doctorInput.value = "";
  if (dateInput) dateInput.value = "";

  extractedPrescription = null;
  editedFields = {};

  renderPrescriptions();
}

/*********************************
 * FETCH PAST PRESCRIPTIONS
 *********************************/
async function fetchPastPrescriptions() {
  const user = auth.currentUser;
  if (!user) return;

  const container = document.getElementById("pastPrescriptionContainer");
  if (!container) return;

  container.innerHTML = "";

  try {
    const snapshot = await getDocs(
      collection(db, "users", user.uid, "prescriptions")
    );

    if (snapshot.empty) {
      container.innerHTML = `<p class="empty">No prescriptions uploaded yet.</p>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      const div = document.createElement("div");
      div.className = "prescription-item";

      div.innerHTML = `
        <p><strong>Doctor:</strong> ${data.doctorName || "Unknown"}</p>
        <p><strong>Date:</strong> ${data.date || "-"}</p>
        <p><strong>Medicines:</strong> ${data.medicines?.length || 0}</p>

        <div class="prescription-details" style="display:none;"></div>
      `;

      div.addEventListener("click", () => {
        togglePrescription(div, data.medicines || []);
      });

      container.appendChild(div);
    });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    container.innerHTML = `<p class="empty">Error loading prescriptions.</p>`;
  }
}

/*********************************
 * TOGGLE PRESCRIPTION DETAILS
 *********************************/
let expandedCard = null;

function togglePrescription(card, medicines) {
  const details = card.querySelector(".prescription-details");

  // Collapse previously opened card
  if (expandedCard && expandedCard !== details) {
    expandedCard.style.display = "none";
  }

  // Toggle current
  if (details.style.display === "block") {
    details.style.display = "none";
    expandedCard = null;
    return;
  }

  details.innerHTML = "";

  if (!medicines.length) {
    details.innerHTML = `<p class="med-row">No medicines found</p>`;
  } else {
    medicines.forEach(med => {
      const row = document.createElement("div");
      row.className = "med-row";
      row.innerHTML = `
        <strong>${med.name || "-"}</strong><br/>
        Dosage: ${med.dosage || "-"} |
        Frequency: ${med.frequency || "-"} |
        Duration: ${med.duration || "-"}
      `;
      details.appendChild(row);
    });
  }

  details.style.display = "block";
  expandedCard = details;
}

/*********************************
 * RENDER PRESCRIPTIONS (LocalStorage)
 *********************************/
function renderPrescriptions() {
  if (!prescriptionContainer) return;

  prescriptionContainer.innerHTML = "";

  if (!prescriptions.length) {
    if (prescriptionSection) prescriptionSection.style.display = "none";
    return;
  }

  if (prescriptionSection) prescriptionSection.style.display = "block";

  prescriptions.forEach(p => {
    const card = document.createElement("div");
    card.className = "prescription-card";

    card.innerHTML = `
      <div class="prescription-info">
        <p><strong>${p.name}</strong></p>
        <p>Doctor: ${p.doctor}</p>
        <p>Date: ${p.date}</p>
      </div>
      <div class="prescription-actions">
        <button class="view-btn">View</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    card.querySelector(".delete-btn").onclick = () => {
      prescriptions = prescriptions.filter(item => item.id !== p.id);
      localStorage.setItem("prescriptions", JSON.stringify(prescriptions));
      renderPrescriptions();
    };

    card.querySelector(".view-btn").onclick = () => {
      alert(`File: ${p.fileName}\n(Preview not implemented yet)`);
    };

    prescriptionContainer.appendChild(card);
  });
}
