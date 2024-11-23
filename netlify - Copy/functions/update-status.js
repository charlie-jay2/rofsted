const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    let data;
    try {
        data = JSON.parse(event.body);
    } catch (error) {
        console.error("Parsing error:", error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid input format." }),
        };
    }

    const { email, status } = data;

    if (!email || !status) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Email and status are required." }),
        };
    }

    const mongoUri = process.env.MONGO_URI;
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        const db = client.db("Ofsted");
        const collection = db.collection("applications");

        const result = await collection.updateOne(
            { email },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Application not found." }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Status updated successfully." }),
        };
    } catch (error) {
        console.error("Error updating status:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to update status." }),
        };
    } finally {
        await client.close();
    }
};
