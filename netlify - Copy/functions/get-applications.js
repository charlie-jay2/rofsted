const { MongoClient } = require("mongodb");
require("dotenv").config();

exports.handler = async () => {
    const mongoUri = process.env.MONGO_URI;

    // Debugging: Ensure MONGO_URI is defined
    console.log("MONGO_URI:", mongoUri);

    if (!mongoUri) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "MONGO_URI is not defined." }),
        };
    }

    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        const db = client.db("Ofsted");
        const collection = db.collection("applications");

        const applications = await collection.find({}).toArray();

        return {
            statusCode: 200,
            body: JSON.stringify(applications),
        };
    } catch (error) {
        console.error("Error fetching applications:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch applications." }),
        };
    } finally {
        await client.close();
    }
};
