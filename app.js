const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const path = require('path');
require('dotenv').config();

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

app.use("/dist", express.static(__dirname + "/dist"));
app.use(express.urlencoded());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  	serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function connectToDatabase() {
	if (!client.topology || !client.topology.isConnected()) {
		await client.connect();
		console.log("Connected to MongoDB");
	}
	return client.db("dogs");
}

app.get("/", async (req, res) => {
    try {
        const db = await connectToDatabase();
        const dogs = await db.collection("dogs").find().toArray();

        res.render('dogs', {dogs});
    } catch (error){
        console.error("Error querying MongoDB:", error);
		res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/dogs", async (req, res) => {
    const { breed, subBreeds } = req.body;
    const sub = subBreeds ? subBreeds.split(",").map(s => s.trim()).filter(Boolean) : [];
    
    const db = await connectToDatabase();
    await db.collection("dogs").insertOne({ breed, subBreeds: sub });
    res.redirect("/");
});

app.post("/dogs/:id/edit", async (req, res) => {
    const { id } = req.params;
    const { breed, subBreeds } = req.body;
    const db = await connectToDatabase();
    const sub = subBreeds ? subBreeds.split(",").map(s => s.trim()).filter(Boolean) : [];
    await db.collection("dogs").updateOne({ _id: new ObjectId(id) }, { $set: { breed, subBreeds: sub } });
    res.redirect("/");
})

app.post("/dogs/:id/delete", async (req, res) => {
    const { id } = req.params;
    const db = await connectToDatabase();
    await db.collection("dogs").deleteOne({ _id: new ObjectId(id) });
    res.redirect("/");
});

app.use((err, req, res, next) => {
    console.error('Uncaught error:', err.stack);
    res.status(500).json({ error: err.message });
});

module.exports = app;