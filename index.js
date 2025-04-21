const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.19ooaii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



let client;
let imageCollections;

// Ensure a single MongoDB client instance
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

connectToDatabase().catch(console.dir);

// Routes
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

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});