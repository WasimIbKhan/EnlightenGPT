import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db("EnlightenGPT");
      await db.command({ ping: 1 });  

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        await client.close();
        return res.status(400).send({ error: "User already exists" });
      }

      // Hash the password before storing it
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = await db.collection('users').insertOne({
        email: email,
        password: hashedPassword
      });

      const userId = result.insertedId;

      // Generate a JWT token
      const token = jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: 86400 // expires in 24 hours
      });

      await client.close();
      res.status(200).send({ 
        message: "User created successfully!", 
        auth: true, 
        token: token, 
        userId: userId 
      });
    } else {
      res.status(405).send({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
