const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const router = express.Router();
const uri = process.env.MONGO_DB_URI;

router.get('/', async (req, res) => 
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

        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ error: "Missing userId in query" });

        const user = await users.findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(404).json({ error: "User not found" });
        
        return res.status(200).json({ emergencyContacts: user.emergencyContacts || [] });
    } 
    catch (err) 
    {
        console.error("Error:", err.message);
        return res.status(500).json({ error: "Server error while fetching contacts" });
    } 
    finally 
    {
    await client.close();
    }
});

module.exports = router;
