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

    const { email } = data;

    if (!email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Email is required." }),
        };
    }

    const mongoUri = process.env.MONGO_URI;
    const client = new MongoClient(mongoUri);

    try {
        await client.connect();
        const db = client.db("Ofsted");
        const collection = db.collection("applications");

        // Delete the application with the matching email
        const result = await collection.deleteOne({ email });

        if (result.deletedCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Application not found." }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Application deleted successfully." }),
        };
    } catch (error) {
        console.error("Error deleting application:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to delete application." }),
        };
    } finally {
        await client.close();
    }
};
