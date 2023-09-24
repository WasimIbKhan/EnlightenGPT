import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    if (req.method === 'GET') {
      const userId = req.query.userId; // Assuming you pass userId as a query parameter
      const client = new MongoClient(MONGODB_URI);
      await client.connect();
      const db = client.db("EnlightenGPT");
      
      // Fetch the user document by userId
      const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
      
      client.close();

      if (user && user.chats) {
        res.status(200).json({ chats: user.chats });
      }
      else if(user) {
        res.status(404).json({ error: `Found user but no chats ${user}`});
      }
       else {
        res.status(404).json({ error: 'No chats found for the user.' });
      }
      
    } else {
      res.status(405).send({ error: "Method not allowed" });
    }

  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
};
