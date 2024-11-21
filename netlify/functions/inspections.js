const querystring = require("querystring");
const fetch = require("node-fetch");

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
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid JSON input." }),
        };
    }

    const {
        discordUsername,
        schoolName,
        sessionTime,
        numMembers,
        inspectionDate,
    } = data;

    if (!discordUsername || !schoolName || !sessionTime || !numMembers || !inspectionDate) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "All fields are required." }),
        };
    }

    const webhookURL = process.env.DISCORD_WEBHOOK_URL2;

    const discordMessage = {
        content: null,
        embeds: [
            {
                title: "New Inspection Request",
                fields: [
                    { name: "Discord Username", value: discordUsername, inline: false },
                    { name: "Ro-School Name", value: schoolName, inline: false },
                    { name: "Session Time", value: sessionTime, inline: false },
                    { name: "Number of Members", value: numMembers, inline: false },
                    { name: "Preferred Date", value: inspectionDate, inline: false },
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
            body: JSON.stringify({ message: "Request submitted successfully." }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
