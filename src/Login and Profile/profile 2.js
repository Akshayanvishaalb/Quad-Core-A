import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-sos.jsx";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDXi-16h6fqkvFhyh96rHPSrcUUYI-r1Lw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quad-core-a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quad-core-a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quad-core-a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "702554879008",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:702554879008:web:c502334c89adb58f8f3845",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-L8ZCNH62LF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const profileForm = document.getElementById("profileForm");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

const fullNameInput = document.getElementById("fullName");
const dobInput = document.getElementById("dob");
const genderInput = document.getElementById("gender");
const bloodGroupInput = document.getElementById("bloodGroup");
const heightInput = document.getElementById("height");
const weightInput = document.getElementById("weight");
const allergiesInput = document.getElementById("allergies");
const conditionsInput = document.getElementById("conditions");
const addressInput = document.getElementById("address");
const emergencyNumberInput = document.getElementById("emergencyNumber");

let currentUser = null;
let isEditing = false;

function disableAllFields() {
  fullNameInput.disabled = true;
  dobInput.disabled = true;
  genderInput.disabled = true;
  bloodGroupInput.disabled = true;
  heightInput.disabled = true;
  weightInput.disabled = true;
  allergiesInput.disabled = true;
  conditionsInput.disabled = true;
  addressInput.disabled = true;
  emergencyNumberInput.disabled = true;
}

function enableAllFields() {
  fullNameInput.disabled = false;
  dobInput.disabled = false;
  genderInput.disabled = false;
  bloodGroupInput.disabled = false;
  heightInput.disabled = false;
  weightInput.disabled = false;
  allergiesInput.disabled = false;
  conditionsInput.disabled = false;
  addressInput.disabled = false;
  emergencyNumberInput.disabled = false;
}

// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     window.location.href = "login.html";
//     return;
//   }
//
//   currentUser = user;
//   await loadUserProfile(user.uid);
//   disableAllFields();
//   saveBtn.disabled = true;
// });

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // User not signed in → redirect to login
    window.location.href = "home.html";
    return;
  }

  // User is signed in → redirect to home page
  if (window.location.pathname.endsWith("login.html")) {
    window.location.href = "home.html";
    return;
  }

  currentUser = user;
  await loadUserProfile(user.uid);
  disableAllFields();
  saveBtn.disabled = true;
});

async function loadUserProfile(uid) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      fullNameInput.value = data.fullName || "";
      dobInput.value = data.dob || "";
      genderInput.value = data.gender || "";
      bloodGroupInput.value = data.bloodGroup || "";
      heightInput.value = data.height || "";
      weightInput.value = data.weight || "";
      allergiesInput.value = data.allergies || "";
      conditionsInput.value = data.conditions || "";
      addressInput.value = data.address || "";
      emergencyNumberInput.value = data.emergencyNumber || "";
    } else {
      fullNameInput.value = currentUser.displayName || "";
    }
  } catch (err) {
    console.error("Profile load failed:", err);
    alert("Failed to load profile");
  }
}

editBtn.addEventListener("click", () => {
  if (!isEditing) {
    enableAllFields();
    saveBtn.disabled = false;
    editBtn.textContent = "Cancel";
    isEditing = true;
  } else {
    disableAllFields();
    loadUserProfile(currentUser.uid);
    saveBtn.disabled = true;
    editBtn.textContent = "Edit";
    isEditing = false;
  }
});

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentUser) return;

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    const data = {
      fullName: fullNameInput.value,
      dob: dobInput.value,
      gender: genderInput.value,
      bloodGroup: bloodGroupInput.value,
      height: heightInput.value,
      weight: weightInput.value,
      allergies: allergiesInput.value,
      conditions: conditionsInput.value,
      address: addressInput.value,
      emergencyNumber: emergencyNumberInput.value,
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, "users", currentUser.uid), data, { merge: true });

    disableAllFields();
    saveBtn.textContent = "Save";
    editBtn.textContent = "Edit";
    isEditing = false;

    alert("Profile updated successfully");
  } catch (err) {
    console.error("Save failed:", err);
    alert("Failed to save profile");
    saveBtn.disabled = false;
    saveBtn.textContent = "Save";
  }
});

window.logout = async function () {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
};
