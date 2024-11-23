const { MongoClient } = require("mongodb");
const querystring = require("querystring");
const fetch = require("node-fetch");

const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    let data;

    try {
        // Parse the incoming JSON body
        if (event.headers["content-type"] === "application/json") {
            data = JSON.parse(event.body);
        } else if (
            event.headers["content-type"] === "application/x-www-form-urlencoded"
        ) {
            data = querystring.parse(event.body);
        } else {
            throw new Error("Unsupported content type");
        }
    } catch (error) {
        console.error("Parsing error:", error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid input format." }),
        };
    }

    const { discordUsername, schoolName, sessionTime, numMembers, inspectionDate } = data;

    if (!discordUsername || !schoolName || !sessionTime || !numMembers || !inspectionDate) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "All fields are required." }),
        };
    }

    // Connect to MongoDB and insert the inspection request
    try {
        await client.connect();
        const database = client.db("Ofsted");
        const collection = database.collection("inspection");

        const inspectionRequest = {
            discordUsername,
            schoolName,
            sessionTime,
            numMembers,
            inspectionDate,
            submittedAt: new Date(),
        };

        // Insert the document into the collection
        await collection.insertOne(inspectionRequest);
        console.log("Inspection request saved to the database");

    } catch (error) {
        console.error("Database error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to save inspection request to the database." }),
        };
    }

    // Send the data to Discord webhook
    const webhookURL = process.env.DISCORD_WEBHOOK_URL2;

    const discordMessage = {
        content: null,
        embeds: [
            {
                title: `New Inspection Request from ${schoolName}`,
                fields: [
                    { name: "Discord Username", value: discordUsername, inline: false },
                    { name: "Ro-School Name", value: schoolName, inline: false },
                    { name: "Preferred Session Time", value: sessionTime, inline: false },
                    { name: "Number of Members", value: numMembers, inline: false },
                    { name: "Preferred Inspection Date", value: inspectionDate, inline: false },
                ],
                color: 5814783,
            },
        ],
    };

    try {
        const response = await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordMessage),
        });

        if (!response.ok) {
            throw new Error("Failed to send Discord message");
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Inspection request submitted successfully." }),
        };
    } catch (error) {
        console.error("Error sending webhook:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    } finally {
        await client.close(); // Close the MongoDB connection
    }
};
