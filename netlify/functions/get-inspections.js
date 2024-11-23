const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGODB_NAME;
const collectionName = "inspection";

exports.handler = async function (event, context) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        const inspections = await collection.find({}).toArray();

        return {
            statusCode: 200,
            body: JSON.stringify(inspections),
        };
    } catch (error) {
        console.error("Error fetching inspections:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to fetch inspections." }),
        };
    } finally {
        await client.close();
    }
};
