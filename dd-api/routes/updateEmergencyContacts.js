const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const router = express.Router();
const uri = process.env.MONGO_DB_URI;

router.post('/', async (req, res) => 
{
    if (!uri || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) 
    {
        return res.status(500).json({ error: "Database connection string is missing or malformed" });
    }

    const client = new MongoClient(uri);

    try 
    {
        await client.connect();
        const db = client.db("DrowsyDB");
        const users = db.collection("users");

        const { userId, emergencyContacts } = req.body;

        if (!userId || !Array.isArray(emergencyContacts)) 
        {
            return res.status(400).json({ error: "Invalid input. 'userId' and an array of 'emergencyContacts' are required." });
        }

    const result = await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { emergencyContacts } }
    );

    if (result.modifiedCount === 0) 
    {
        return res.status(404).json({ error: "User not found or no changes made." });
    }

    return res.status(200).json({ message: "Emergency contacts updated successfully" });

    } 
    catch (err) 
    {
        console.error("Error:", err.message);
        return res.status(500).json({ error: "Server error while updating contacts" });
    } 
    finally 
    {
        await client.close();
    }
});

module.exports = router;
