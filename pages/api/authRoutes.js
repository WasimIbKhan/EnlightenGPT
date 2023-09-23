// authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const router = express.Router();

JWT_SECRET=process.env.JWT_SECRET
MONGODB_URI=process.env.MONGODB_URI


router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 8);

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db('YOUR_DB_NAME');
    const result = await db.collection('users').insertOne({ username, password: hashedPassword });

    if (result.insertedCount > 0) {
        res.status(201).send({ message: 'User registered successfully!' });
    } else {
        res.status(500).send({ message: 'Registration failed.' });
    }

    await client.close();
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const client = new MongoClient(MONGO_URI);
    try {
        const user = await db.collection('users').findOne({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });
        res.status(200).send({ auth: true, token });
    } else {
        res.status(401).send({ auth: false, token: null });
    }

    await client.close();
    } catch (error) {
        console.log(error)
    }
    
});

module.exports = router;
