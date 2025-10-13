// server/firebase-admin/firebaseAdmin.js
import admin from "firebase-admin";
import express from "express";
import cors from "cors";

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to verify Firebase ID token
app.post("/verify-token", async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ error: "Missing ID token" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return res.status(200).json({ uid: decodedToken.uid, valid: true });
    } catch (error) {
        return res.status(401).json({ error: "Invalid token", details: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Firebase Admin server running on port ${PORT}`);
});
