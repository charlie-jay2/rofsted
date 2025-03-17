const querystring = require("querystring");
const fetch = require("node-fetch");
const { MongoClient } = require("mongodb");

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
        if (event.headers["content-type"] === "application/json") {
            data = JSON.parse(event.body);
        } else if (event.headers["content-type"] === "application/x-www-form-urlencoded") {
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

    const { discordUsername, email, schoolName, sessionTime, numMembers, inspectionDate } = data;

    if (!discordUsername || !email || !schoolName || !sessionTime || !numMembers || !inspectionDate) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "All fields are required." }),
        };
    }

    try {
        await client.connect();
        const database = client.db("Ofsted");
        const collection = database.collection("inspection");

        const inspectionRequest = {
            discordUsername,
            email,
            schoolName,
            sessionTime,
            numMembers,
            inspectionDate,
            submittedAt: new Date(),
        };

        await collection.insertOne(inspectionRequest);
        console.log("Inspection request saved to the database");

    } catch (error) {
        console.error("Database error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to save inspection request." }),
        };
    }

    const webhookURL = process.env.DISCORD_WEBHOOK_URL;
    const discordMessage = {
        content: null,
        embeds: [
            {
                title: `New Inspection Request from ${schoolName}`,
                fields: [
                    { name: "Discord Username", value: discordUsername, inline: false },
                    { name: "Email", value: email, inline: false },
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
        await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordMessage),
        });

        return { statusCode: 200, body: JSON.stringify({ message: "Request submitted successfully." }) };
    } catch (error) {
        console.error("Webhook error:", error.message);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to send Discord message." }) };
    } finally {
        await client.close();
    }
};
