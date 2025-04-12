const { app } = require('@azure/functions');
const { MongoClient } = require('mongodb');

app.http('loginUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (req, context) => {
    const uri = process.env["COSMOS_DB_URI"];
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("DrowsyDB");
      const users = db.collection("users");

      const { email, password } = await req.json();

      if (!email || !password) {
        return { status: 400, jsonBody: { error: 'Missing email or password' } };
      }

      const user = await users.findOne({ email, password }); // ⚠️ In production, hash & compare
      if (!user) {
        return { status: 401, jsonBody: { error: 'Invalid credentials' } };
      }

      return {
        status: 200,
        jsonBody: {
          message: 'Login successful',
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        }
      };
    } catch (err) {
      context.log('Login Error:', err);
      return { status: 500, jsonBody: { error: 'Server error' } };
    } finally {
      await client.close();
    }
  }
});
