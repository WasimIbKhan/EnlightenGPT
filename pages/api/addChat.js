import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { userId, chatTitle, fileLocations } = req.body;
      const chat_id = new ObjectId().toString()
      const createdAt = new Date();
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db("EnlightenGPT");
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
            $push: {
                chats: {
                    chat_id: chat_id, // Generate the chatId here
                    chatTitle: chatTitle,
                    docs: fileLocations,
                    createdAt: createdAt
                }
            }
        }
    )
    client.close();
    res.status(200).send({ 
        message: "file locations uploaded successfully!",
        chatId: chat_id,
        fileLocations: fileLocations,
        createdAt: createdAt
      });
    } else {
      res.status(405).send({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
