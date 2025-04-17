const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/send-alert', async (req, res) => 
{
    const licenseKey = req.query.licenseKey;
    if (!licenseKey) 
    {
        return res.status(400).json({ error: 'Missing licenseKey' });
    }

    const client = new MongoClient(process.env.COSMOS_DB_URI);
    try 
    {
        await client.connect();
        const db = client.db('DrowsyDB');
        const users = db.collection('users');

        const user = await users.findOne({ "device-key": licenseKey });
        if (!user || !user.emergencyContacts) 
        {
        return res.status(404).json({ error: 'No emergency contacts found' });
        }

        console.log('📱 Emergency Contacts for', user.email);
        user.emergencyContacts.forEach(contact => 
        {
            console.log(`- ${contact.name}: ${contact.phone}`);
        });

        res.json({ success: true, count: user.emergencyContacts.length });
    } 
    catch (err) 
    {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
    finally 
    {
        await client.close();
    }
    });

app.listen(PORT, () => 
{
  console.log(`API is live at http://localhost:${PORT}/send-alert`);
});
