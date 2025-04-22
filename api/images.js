// /api/images.js
import { MongoClient, ServerApiVersion } from 'mongodb';

let client;
let imageCollections;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.19ooaii.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        imageCollections = client.db("photoshub").collection("images");
    }
}

export default async function handler(req, res) {
    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const result = await imageCollections.find().toArray();
            return res.status(200).json(result);
        }

        if (req.method === 'POST') {
            const { images, user } = req.body;

            if (!images || !Array.isArray(images) || images.length === 0) {
                return res.status(400).json({ message: "No images provided" });
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
            return res.status(201).json({
                message: "Images uploaded successfully",
                insertedCount: result.insertedCount,
            });
        }

        return res.status(405).json({ message: "Method Not Allowed" });
    } catch (error) {
        console.error("API error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
