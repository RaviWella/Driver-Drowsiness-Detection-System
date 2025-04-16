const { app } = require('@azure/functions');
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

app.http('registerUser', 
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
			const db = client.db("DrowsyDB");
			const users = db.collection("users");

			const newUser = await request.json();
			const { firstName, lastName, email, password } = newUser;

			// validate required fields
			if (!firstName || !lastName || !email || !password) 
			{
				return {
				status: 400,
				jsonBody: { error: "Missing required fields" }
				};
			}

			// validate duplications
			const existingUser = await users.findOne({ email });
			if (existingUser) {
				return {
				status: 409,
				jsonBody: { error: "Email already registered" }
				};
			}

			// hash the password
			const hashedPassword = await bcrypt.hash(password, 10);

			// store data in the db
			const result = await users.insertOne(
				{
					firstName,
					lastName,
					email,
					password: hashedPassword,
					createdAt: new Date()
				}
			);

			return {
				status: 201,
				jsonBody: { message: "User registered successfully", id: result.insertedId }
			};
			} 
			catch (error) 
			{
				context.log("Error:", error);
				return {
					status: 500,
					jsonBody: { error: "Failed to register user" }
				};
			} 
			finally 
			{
				await client.close();
			}
		}
	}
);
