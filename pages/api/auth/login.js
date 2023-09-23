// pages/api/login.js
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db("chatbotDB");
      await db.command({ ping: 1 });  
      const user = await db.collection('users').findOne({ email });
      
      if (user && bcrypt.compareSync(password, user.password)) {
        const tokenPayload = { auth: true, userId: user._id };
        const token = jwt.sign(tokenPayload, JWT_SECRET, {
          expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token: token, userId: user._id });
      } else {
        res.status(401).send({ auth: false, token: null });
      }
      
  
      await client.close();
    } else {
      res.status(405).end(); // Method Not Allowed
    }
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
