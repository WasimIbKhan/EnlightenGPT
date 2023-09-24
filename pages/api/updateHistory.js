import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { newHistory, userId, chatId } = req.body;
      
      const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      await client.connect();
      
      const db = client.db("EnlightenGPT");
      
      // Append new history to the existing history array
      const result = await db.collection('users').updateOne(
        { _id: new ObjectId(userId), "chats.chat_id": chatId },
        { $push: { "chats.$.history": { $each: newHistory } } } // Use $each to append new history
      );
      
      client.close();
      
      if (result.modifiedCount > 0) {
        res.status(200).send({ message: "History updated successfully!" });
      } else {
        res.status(404).send({ error: "User or chat not found" });
      }
    } else {
      res.status(405).send({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in updating history:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
