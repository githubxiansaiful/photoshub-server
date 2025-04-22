const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.19ooaii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

let client;
let imageCollections;

async function connectToDatabase() {
    if (!client) {
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
        await client.connect();
        console.log("Connected to MongoDB");
        imageCollections = client.db("photoshub").collection("images");
    }
}

app.get('/images', async (req, res) => {
    try {
        await connectToDatabase();
        const result = await imageCollections.find().toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.post('/images', async (req, res) => {
    try {
        await connectToDatabase();
        const { images, user } = req.body;

        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).send({ message: "No images provided" });
        }

        const docs = images.map((img) => ({
            imgUrl: img.url,
            title: img.title,
            category: img.category,
            tag: img.tag,
            user: {
                displayName: user?.displayName || null,
                email: user?.email || null,
                photoURL: user?.photoURL || null,
            },
            createdAt: new Date(),
        }));

        const result = await imageCollections.insertMany(docs);
        res.status(201).send({
            message: "Images uploaded successfully",
            insertedCount: result.insertedCount,
        });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server is running locally on http://localhost:${port}`);
    });
}


// ✅ EXPORT the express app as handler for Vercel serverless function
module.exports = app;
