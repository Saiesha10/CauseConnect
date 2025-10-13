// server/firebase-admin/verifyToken.js
import express from "express";
import cors from "cors";
import { adminAuth } from "./index.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/verifyToken", async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "No token provided" });

    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        res.json({ uid: decodedToken.uid });
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
});

app.listen(4000, () => console.log("Firebase token server running on port 4000"));
