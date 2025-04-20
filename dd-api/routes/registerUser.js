const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const router = express.Router();
const uri = process.env.MONGO_DB_URI;

router.post('/', async (req, res) => 
{
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) 
    {
        console.error("MONGO_DB_URI is missing or invalid");
        return res.status(500).json({ error: "Database connection string is missing or invalid" });
    }

  const client = new MongoClient(uri, { useUnifiedTopology: true });

    try 
    {
        await client.connect();
        const db = client.db("DrowsyDB");
        const users = db.collection("users");
        const validKeys = db.collection("validDeviceKeys");

        const { firstName, lastName, email, password, deviceKey } = req.body;

        if (!firstName || !lastName || !email || !password || !deviceKey) 
        {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // validate user
        const existingUser = await users.findOne({ email });
        if (existingUser) 
        {
            return res.status(409).json({ error: "Email already registered" });
        }

        // validate device key
        const keyDoc = await validKeys.findOne({ deviceKey });

        if (!keyDoc) 
        {
            return res.status(403).json({ error: "Invalid device key." });
        }

        if (keyDoc.status === "active") 
            {
            return res.status(403).json({ error: "Device key already used." });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert new user
        const result = await users.insertOne(
        {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            deviceKey,
            createdAt: new Date()
        });

        // mark device key as used
        await validKeys.updateOne(
        { deviceKey },
        { $set: { status: "active" } }
        );

        return res.status(201).json(
        {
            message: "User registered successfully",
            id: result.insertedId
        });

        } 
        catch (error)
        {
            console.error("Registration error:", error.message);
            return res.status(500).json({ error: "Failed to register user" });
        } 
        finally 
        {
            await client.close();
        }
});

module.exports = router;
