/* =====================
   Firebase Imports
===================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================
   Firebase Config
===================== */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_Firebase_API_Key,
  authDomain: "quad-core-a.firebaseapp.com",
  projectId: "quad-core-a",
  storageBucket: "quad-core-a.appspot.com",
  messagingSenderId: "702554879008",
  appId: "1:702554879008:web:c502334c89adb58f8f3845"
};

/* =====================
   Firebase Init
===================== */
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

/* =====================
   DOM Elements
===================== */
const uploadBtn = document.getElementById("uploadBtn");
const reportFile = document.getElementById("reportFile");
const reportName = document.getElementById("reportName");
const reportsContainer = document.getElementById("reportsContainer");
const reportsSection = document.getElementById("reportsSection");

let currentUserId = null;

/* =====================
   Auth Listener
===================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login");
    return;
  }

  currentUserId = user.uid;
  await loadUserReports();
});

/* =====================
   Dark Mode
===================== */
function applyDarkMode() {
  document.body.classList.toggle(
    "dark-mode",
    localStorage.getItem("darkMode") === "true"
  );
}
document.addEventListener("DOMContentLoaded", applyDarkMode);

/* =====================
   Upload Report
===================== */
uploadBtn.addEventListener("click", async () => {
  if (!currentUserId) return alert("User not authenticated");

  const file = reportFile.files[0];
  const name = reportName.value.trim();

  if (!file || !name) {
    return alert("Please select a file and enter report name.");
  }

  try {
    const filePath = `reports/${currentUserId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, filePath);

    // Upload file
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    // Save metadata to Firestore
    const docRef = await addDoc(collection(db, "reports"), {
      uid: currentUserId,
      name,
      filePath,
      url: downloadURL,
      uploadedAt: serverTimestamp()
    });

    // Update UI immediately
    addReportToUI({
      id: docRef.id,
      name,
      date: new Date().toLocaleDateString(),
      url: downloadURL,
      filePath
    });

    reportsSection.style.display = "block";
    reportFile.value = "";
    reportName.value = "";
    document.getElementById("fileName").innerText = "No file selected";

  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
});

/* =====================
   Load Reports (Firestore)
===================== */
async function loadUserReports() {
  reportsContainer.innerHTML = "";

  const q = query(
    collection(db, "reports"),
    where("uid", "==", currentUserId),
    orderBy("uploadedAt", "desc")
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    reportsSection.style.display = "none";
    return;
  }

  reportsSection.style.display = "block";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    addReportToUI({
      id: docSnap.id,
      name: data.name,
      date: data.uploadedAt?.toDate().toLocaleDateString(),
      url: data.url,
      filePath: data.filePath
    });
  });
}

/* =====================
   UI Renderer
===================== */
function addReportToUI(report) {
  const div = document.createElement("div");
  div.className = "report-item";

  div.innerHTML = `
    <div class="report-info">
      <strong>${report.name}</strong>
      <span>Uploaded on ${report.date}</span>
    </div>
    <div class="report-actions">
      <button onclick="window.open('${report.url}', '_blank')">View</button>
      <button class="delete"
        onclick="deleteReport('${report.id}', '${report.filePath}', this)">
        Delete
      </button>
    </div>
  `;

  reportsContainer.appendChild(div);
}

/* =====================
   Delete Report
===================== */
async function deleteReport(docId, filePath, btn) {
  if (!confirm("Delete this report permanently?")) return;

  try {
    await deleteObject(ref(storage, filePath));
    await deleteDoc(doc(db, "reports", docId));

    btn.closest(".report-item").remove();

    if (reportsContainer.children.length === 0) {
      reportsSection.style.display = "none";
    }
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
}

window.deleteReport = deleteReport;

/* =====================
   File Name Display
===================== */
document.getElementById("reportFile").addEventListener("change", function () {
  document.getElementById("fileName").innerText =
    this.files[0]?.name || "No file selected";
});
