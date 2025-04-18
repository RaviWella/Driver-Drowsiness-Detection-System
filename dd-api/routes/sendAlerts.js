const express = require('express');
const { MongoClient } = require('mongodb');
const twilio = require('twilio');
require('dotenv').config();

const router = express.Router();
const uri = process.env.MONGO_DB_URI;

const clientTwilio = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

router.get('/', async (req, res) => {
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
        return res.status(500).json({ error: "Database connection string is missing or malformed" });
    }

    const deviceKey = req.query.deviceKey;
    if (!deviceKey) {
        return res.status(400).json({ error: "Missing deviceKey in query" });
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("DrowsyDB");
        const users = db.collection("users");

        const user = await users.findOne({ "device-key": deviceKey });

        if (!user || !Array.isArray(user.emergencyContacts) || user.emergencyContacts.length === 0) {
            return res.status(404).json({ error: "No user or emergency contacts found" });
        }

        const sendResults = [];

        for (const contact of user.emergencyContacts) {
            try {
                const to = contact.phone;
                const from = process.env.TWILIO_PHONE_NUMBER;
                const message = `ALERT: ${user.firstName} ${user.lastName} may be drowsy while driving. Please check on them immediately.`;

                const result = await clientTwilio.messages.create({
                    body: message,
                    from: from,
                    to: to
                });

                sendResults.push({ to: contact.phone, sid: result.sid, status: result.status });
                console.log(`Text message sent to ${contact.name}: ${contact.phone}`);
            } catch (err) {
                console.error(`Failed to send to ${contact.name}:`, err.message);
                sendResults.push({ to: contact.phone, error: err.message });
            }
        }

        return res.status(200).json({
            message: "Text messages sent to emergency contacts",
            results: sendResults
        });

    } catch (err) {
        console.error("Error sending SMS:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        await client.close();
    }
});

module.exports = router;
