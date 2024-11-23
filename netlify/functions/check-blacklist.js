const { MongoClient } = require("mongodb");

exports.handler = async function (event, context) {
    // Get the user's IP address from the headers
    let ipAddress = event.headers['x-forwarded-for'] || event.requestContext.identity.sourceIp;

    // Normalize IP address to handle both IPv4 and IPv6 (localhost issue)
    let normalizedIp = ipAddress.split(',')[0].trim(); // Handle possible proxy forwarded IPs
    if (normalizedIp === '::1') {
        normalizedIp = '127.0.0.1'; // Convert IPv6 localhost (::1) to IPv4 localhost (127.0.0.1)
    }

    // Log the IP for debugging purposes
    console.log("User IP being checked:", normalizedIp);

    // Get MongoDB URI from environment variable
    const uri = process.env.MONGO_URI;

    // Check if MongoDB URI is provided
    if (!uri) {
        console.error("MongoDB URI is missing");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "MongoDB URI is missing in environment variables" }),
        };
    }

    // Connect to the MongoDB database
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('Ofsted');  // Ensure the DB name is correct
        const blacklists = database.collection('blacklist');  // Ensure collection name is correct

        // Log the IP and query result for debugging
        console.log("Checking blacklist for IP:", normalizedIp);

        // Check if the IP is blacklisted
        const blacklistEntry = await blacklists.findOne({ IP: normalizedIp });

        // Log the result of the query
        console.log("Blacklist check result:", blacklistEntry);

        // If the IP is found in the blacklist, redirect to the 403 page
        if (blacklistEntry) {
            console.log("IP is blacklisted, redirecting...");
            return {
                statusCode: 301,
                headers: {
                    Location: "https://ofsted.netlify.app/403/403.html", // Redirect to 403 error page
                },
            };
        }

        // If not blacklisted, allow the request to proceed
        return {
            statusCode: 200,
        };
    } catch (error) {
        console.error('Error checking blacklist:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    } finally {
        await client.close();
    }
};
