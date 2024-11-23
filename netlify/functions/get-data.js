const { MongoClient } = require("mongodb");

exports.handler = async (event) => {
    const mongoUri = process.env.MONGO_URI;
    const client = new MongoClient(mongoUri);

    try {
        // Get the user's IP address from the request headers
        const userIP =
            event.headers["x-forwarded-for"] || // Proxy/Netlify-provided IP
            event.headers["client-ip"] ||
            event.headers["x-real-ip"] || // Reverse proxy-provided IP
            event.connection.remoteAddress;

        // If the IP is "::1", adjust for local testing
        const formattedIP = userIP === "::1" ? "127.0.0.1" : userIP;

        // Connect to MongoDB
        await client.connect();
        const db = client.db("Ofsted");
        const accessCollection = db.collection("access");

        // Insert the user's IP and timestamp into the database
        await accessCollection.insertOne({
            ip: formattedIP,
            accessedAt: new Date().toISOString(),
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "IP and time logged successfully.",
                ip: formattedIP,
            }),
        };
    } catch (error) {
        console.error("Error logging IP:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error." }),
        };
    } finally {
        await client.close();
    }
};
