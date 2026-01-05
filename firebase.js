// src/firebase.js
// import admin from "firebase-admin";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
//
// // Needed to get __dirname in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//
// // Read service account JSON manually
// const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
// console.log("serviceAccountPath", serviceAccountPath);
// const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
//
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
//
// const db = admin.firestore();
// export default db;

// Below is modified for vercel deployment
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
        JSON.parse(process.env.VITE_GoogleMaps_Service_JSON)
    )
  });
}

const db = admin.firestore();
export default db;

