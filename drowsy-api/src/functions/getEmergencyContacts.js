const { app } = require('@azure/functions');
const { MongoClient, ObjectId } = require("mongodb");

app.http('getEmergencyContacts', 
{
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (req, context) => 
    {
        const uri = process.env["COSMOS_DB_URI"];
        const client = new MongoClient(uri);

        try 
        {
            await client.connect();
            const db = client.db("DrowsyDB");
            const users = db.collection("users");

            const userId = req.query.get("userId");
            if (!userId) 
            {
                return { status: 400, jsonBody: { error: "Missing userId" } };
            }

            const user = await users.findOne({ _id: new ObjectId(userId) });

            if (!user) 
            {
                return { status: 404, jsonBody: { error: "User not found" } };
            }

            return {
                status: 200,
                jsonBody: { emergencyContacts: user.emergencyContacts || [] }
            };
        } 
        catch (err) 
        {
            context.log("Get Contacts Error:", err);
            return { status: 500, jsonBody: { error: "Server error" } };
        } 
        finally 
        {
        await client.close();
        }   
    }
});
