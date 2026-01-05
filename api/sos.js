// OM OM OM
import axios from "axios";
import db from "../firebase.js";
import admin from "firebase-admin";

function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { lat, lng } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ error: "Location missing" });
        }

        const GOOGLE_MAPS_API_KEY = process.env.VITE_GoogleMaps_API_Key;

        const radii = [1000, 2000, 5000, 10000];
        let hospital = null;
        let usedRadius = null;

        for (const radius of radii) {
            const url =
                `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
                `?location=${lat},${lng}&radius=${radius}&type=hospital&key=${GOOGLE_MAPS_API_KEY}`;

            const response = await axios.get(url);

            if (response.data?.results?.length) {
                hospital = response.data.results[0];
                usedRadius = radius;
                break;
            }
        }

        if (!hospital) {
            return res.status(404).json({ error: "No hospitals found" });
        }

        const distanceKm = getDistanceInKm(
            lat,
            lng,
            hospital.geometry.location.lat,
            hospital.geometry.location.lng
        );

        await db.collection("sos_requests").add({
            location: { lat, lng },
            hospital: {
                name: hospital.name,
                address: hospital.vicinity
            },
            radiusUsed: usedRadius,
            status: "SOS_SENT",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            status: "SOS SENT",
            hospital: hospital.name,
            address: hospital.vicinity,
            distance: distanceKm.toFixed(2) + " Km"
        });

    } catch (err) {
        console.error("SOS ERROR:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
