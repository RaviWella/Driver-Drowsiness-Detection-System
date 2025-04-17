const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const router = express.Router();
const uri = process.env.MONGO_DB_URI;

router.get('/', async (req, res) => {
  if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    return res.status(500).json({ error: "Database connection string is missing or malformed" });
  }

  const licenseKey = req.query.licenseKey;
  if (!licenseKey) {
    return res.status(400).json({ error: "Missing licenseKey in query" });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("DrowsyDB");
    const users = db.collection("users");

    const user = await users.findOne({ "device-key": licenseKey });

    if (!user || !Array.isArray(user.emergencyContacts)) {
      return res.status(404).json({ error: "No user or emergency contacts found" });
    }

    console.log(`Emergency contacts for ${user.email}:`);
    user.emergencyContacts.forEach(contact => {
      console.log(`${contact.name} - ${contact.phone}`);
    });

    return res.status(200).json({
      message: "Contacts logged to console",
      count: user.emergencyContacts.length
    });

  } catch (err) {
    console.error("Error fetching contacts:", err.message);
    return res.status(500).json({ error: "Server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;
