import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  // apiKey: "",
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

// const GEMINI_API_KEY = "";
const GEMINI_API_KEY = import.meta.env.VITE_Gemni_API_Key;
const fileInput = document.getElementById("prescriptionFile");
const fileNameText = document.getElementById("fileName");
const nameInput = document.getElementById("prescriptionName");
const doctorInput = document.getElementById("doctorName");
const dateInput = document.getElementById("prescribedDate");
const uploadBtn = document.getElementById("uploadBtn");

const prescriptionSection = document.getElementById("prescriptionSection");
const prescriptionContainer = document.getElementById("prescriptionContainer");

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
  
  const json_output = extractJson(text);
  console.log(json_output["date"]);

  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const docRef = await addDoc(collection(db, "users", user.uid, "prescriptions"), {
    doctorName : json_output["doctor_name"],
    date : json_output["date"],
    medicines : json_output["medicines"]
  });

  console.log("Document written with ID: ", docRef.id);
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

    if (extracted.patient_name)
      nameInput.value = extracted.patient_name;

    if (extracted.doctor_name)
      doctorInput.value = extracted.doctor_name;

    if (extracted.date)
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
 * UPLOAD
 *********************************/
uploadBtn.addEventListener("click", () => {
  if (!fileInput.files[0] || !nameInput.value || !doctorInput.value || !dateInput.value) {
    alert("Please fill all fields.");
    return;
  }

  prescriptions.push({
    id: Date.now(),
    name: nameInput.value,
    doctor: doctorInput.value,
    date: dateInput.value,
    fileName: fileInput.files[0].name
  });

  localStorage.setItem("prescriptions", JSON.stringify(prescriptions));

  fileInput.value = "";
  fileNameText.textContent = "No file chosen";
  nameInput.value = "";
  doctorInput.value = "";
  dateInput.value = "";

  renderPrescriptions();
});

/*********************************
 * RENDER
 *********************************/
function renderPrescriptions() {
  prescriptionContainer.innerHTML = "";

  if (!prescriptions.length) {
    prescriptionSection.style.display = "none";
    return;
  }

  prescriptionSection.style.display = "block";

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
