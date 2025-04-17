const { app } = require('@azure/functions');
const { MongoClient } = require('mongodb');
const bcrypt = require("bcryptjs");

app.http('loginUser', 
{
    methods: ['POST'],
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
            const { email, password } = await req.json();

            // validate required fields
            if (!email || !password) 
            {
                return { status: 400, jsonBody: { error: 'Missing required fields' } };
            }

            // validate credentials
            const user = await users.findOne({ email });
            if (!user) 
            {
                return { status: 401, jsonBody: { error: 'Invalid credentials' } };
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) 
            {
                return { status: 401, jsonBody: { error: 'Invalid credentials' } };
            }

            return {
                status: 200,
                jsonBody: 
                {
                    message: 'Login successful',
                    user: 
                    {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                }
            };
        } 
        catch (err) 
        {
            context.log('Login Error:', err);
            return { status: 500, jsonBody: { error: 'Server error' } };
        } 
        finally 
        {
            await client.close();
        }
    }
});
