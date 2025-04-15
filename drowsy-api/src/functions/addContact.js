const { app } = require('@azure/functions');
const { MongoClient } = require("mongodb");


// azure Functions Node.js v4 model
app.http('addContact', 
    {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) =>
        {
            const uri = process.env["COSMOS_DB_URI"];
            const client = new MongoClient(uri);

            try 
            {
                await client.connect();
                const database = client.db("DrowsyDB");
                const collection = database.collection("contacts");

                const newContact = await request.json();

                if (!newContact.name || !newContact.phone) {
                    return {
                        status: 400,
                        jsonBody: { error: "Missing name or phone" }
                    };
                }

                const result = await collection.insertOne(newContact);

                return {
                    status: 201,
                    jsonBody: {
                        message: "Contact added successfully",
                        id: result.insertedId
                    }
                };
            } 
            catch (err) 
            {
                context.log("Error:", err);
                return {
                    status: 500,
                    jsonBody: { error: "Failed to insert contact" }
                };
            } 
            finally 
            {
                await client.close();
            }
        }
    }
);
