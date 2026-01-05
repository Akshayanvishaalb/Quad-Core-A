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

