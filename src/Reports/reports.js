import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* =====================
   Firebase Config
===================== */
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
const storage = getStorage(app);
const auth = getAuth(app);

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
  const isDark = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark-mode", isDark);
}

document.addEventListener("DOMContentLoaded", applyDarkMode);

/* =====================
   Upload Report
===================== */
uploadBtn.addEventListener("click", async () => {
  if (!currentUserId) {
    alert("User not authenticated");
    return;
  }

  const file = reportFile.files[0];
  const name = reportName.value.trim();

  if (!file || !name) {
    alert("Please select a file and enter report name.");
    return;
  }

  try {
    const filePath = `reports/${currentUserId}/${Date.now()}_${file.name}`;
    const fileRef = ref(storage, filePath);

    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);

    addReportToUI({
      name,
      date: new Date().toLocaleDateString(),
      url: downloadURL,
      fullPath: filePath
    });

    reportsSection.style.display = "block";
    reportFile.value = "";
    reportName.value = "";
    document.getElementById("fileName").innerText = "No file selected";

    alert("Report uploaded successfully!");
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
});

/* =====================
   Load User Reports
===================== */
async function loadUserReports() {
  reportsContainer.innerHTML = "";

  const userFolderRef = ref(storage, `reports/${currentUserId}`);
  const result = await listAll(userFolderRef);

  if (result.items.length === 0) {
    reportsSection.style.display = "none";
    return;
  }

  reportsSection.style.display = "block";

  for (const item of result.items) {
    const url = await getDownloadURL(item);

    addReportToUI({
      name: item.name.split("_").slice(1).join("_"),
      date: "—",
      url,
      fullPath: item.fullPath
    });
  }
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
      <button class="delete" onclick="deleteReport('${report.fullPath}', this)">
        Delete
      </button>
    </div>
  `;

  reportsContainer.appendChild(div);
}

/* =====================
   Delete Report
===================== */
async function deleteReport(fullPath, btn) {
  if (!confirm("Delete this report permanently?")) return;

  try {
    const fileRef = ref(storage, fullPath);
    await deleteObject(fileRef);

    btn.closest(".report-item").remove();

    if (reportsContainer.children.length === 0) {
      reportsSection.style.display = "none";
    }

    alert("Report deleted");
  } catch (err) {
    console.error(err);
    alert("Failed to delete report");
  }
}

/* =====================
   File Name Display
===================== */
document.getElementById("reportFile").addEventListener("change", function () {
  document.getElementById("fileName").innerText =
    this.files[0]?.name || "No file selected";
});
