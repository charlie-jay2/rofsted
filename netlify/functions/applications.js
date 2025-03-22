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
        // Attempt to parse JSON first
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

    const { name, email, benefit, doas, manage, bring, jobTitle, resume } = data;

    if (!name || !email || !jobTitle || !resume || !benefit || !doas || !manage || !bring) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "All fields are required." }),
        };
    }

    // Send the data to Discord webhook
    const webhookURL = process.env.DISCORD_WEBHOOK_URL;

    const discordMessage = {
        content: null,
        embeds: [
            {
                title: `New Application for ${jobTitle}`,
                fields: [
                    { name: "Name", value: name, inline: false },
                    { name: "Email", value: email, inline: false },
                    { name: "How can you benefit ofsted", value: benefit, inline: false },
                    { name: "What can you do as Inspector", value: doas, inline: false },
                    { name: "How can you manage investigations", value: manage, inline: false },
                    { name: "What would you bring to Ofsted", value: bring, inline: false },
                    { name: "Resume", value: resume, inline: false },
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
            body: JSON.stringify({ message: "Application submitted successfully." }),
        };
    } catch (error) {
        console.error("Error sending webhook:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
