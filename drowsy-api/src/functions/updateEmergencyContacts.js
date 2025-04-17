const { app } = require('@azure/functions');
const { MongoClient, ObjectId } = require("mongodb");

app.http('updateEmergencyContacts', 
{
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (req, context) => {
    const uri = process.env["COSMOS_DB_URI"];
    const client = new MongoClient(uri);

    try 
    {
        await client.connect();
        const db = client.db("DrowsyDB");
        const users = db.collection("users");

        const { userId, emergencyContacts } = await req.json();

        if (!userId || !Array.isArray(emergencyContacts)) 
        {
        return { status: 400, jsonBody: { error: "Invalid input" } };
        }

        const result = await users.updateOne
        (
            { _id: new ObjectId(userId) },
            { $set: { emergencyContacts } }
        );

        return {
            status: 200,
            jsonBody: { message: "Emergency contacts updated" }
        };
    } 
    catch (err) 
    {
        context.log("Update Contacts Error:", err);
        return { status: 500, jsonBody: { error: "Server error" } };
    } 
    finally 
    {
        await client.close();
    }
  }
});
