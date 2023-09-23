// pages/api/connectMongo.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await client.connect();
    await client.db("chatbotDB").command({ ping: 1 });
    res.status(200).json({ message: "Connected to MongoDB successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to MongoDB" });
  } finally {
    await client.close();
  }
}
