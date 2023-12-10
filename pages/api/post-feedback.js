const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).end(); // Method Not Allowed
    }
  
    const { rating, comment } = req.body;
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('EnlightenGPT');

    await db.collection('feedback').insertOne({
      rating: parseInt(rating),
      comment,
      timestamp: new Date(),
    });

    await client.close(); // Close the database connection

    res.status(201).json({ message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
