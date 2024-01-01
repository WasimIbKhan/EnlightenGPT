// File: /pages/api/updateChatIds.js
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

export default async (req, res) => {
  if (req.method === 'POST') {
    const client = new MongoClient(MONGODB_URI);
    try {
      await client.connect();
      const db = client.db("EnlightenGPT");
      const users = db.collection('users');

      // Fetch all user documents
      const allUsers = await users.find().toArray();

      for (const user of allUsers) {
        const updatedChats = user.chats.map(chat => {
          // Replace chat_id with chatTitle
          return {...chat, chat_id: chat.chatTitle};
        });

        // Update the user document with modified chats array
        await users.updateOne(
          { _id: user._id },
          { $set: { chats: updatedChats } }
        );
      }

      res.status(200).send({ message: "Chat IDs updated successfully!" });
    } catch (error) {
      console.error("Error updating chat IDs:", error);
      res.status(500).send({ error: "Internal Server Error" });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).send({ error: "Method not allowed" });
  }
};
