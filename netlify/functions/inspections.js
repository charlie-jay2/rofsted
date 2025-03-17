const fetch = require('node-fetch');
const querystring = require('querystring');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    let data;

    try {
        if (event.headers['content-type'] === 'application/json') {
            data = JSON.parse(event.body);
        } else if (event.headers['content-type'] === 'application/x-www-form-urlencoded') {
            data = querystring.parse(event.body);
        } else {
            throw new Error('Unsupported content type');
        }
    } catch (error) {
        console.error('Parsing error:', error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid input format.' }),
        };
    }

    const { discordUsername, schoolName, sessionTime, numMembers, inspectionDate, email } = data;

    if (!discordUsername || !schoolName || !sessionTime || !numMembers || !inspectionDate || !email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'All fields are required.' }),
        };
    }

    const webhookURL = process.env.DISCORD_WEBHOOK_URL;

    const discordMessage = {
        content: null,
        embeds: [
            {
                title: `New Inspection Request from ${schoolName}`,
                fields: [
                    { name: 'Discord Username', value: discordUsername, inline: false },
                    { name: 'Ro-School Name', value: schoolName, inline: false },
                    { name: 'Preferred Session Time', value: sessionTime, inline: false },
                    { name: 'Number of Members', value: numMembers, inline: false },
                    { name: 'Preferred Inspection Date', value: inspectionDate, inline: false },
                    { name: 'Email', value: email, inline: false },
                ],
                color: 5814783,
            },
        ],
    };

    try {
        const response = await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordMessage),
        });

        if (!response.ok) {
            throw new Error(`Failed to send Discord message: ${response.statusText}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Inspection request submitted successfully.' }),
        };
    } catch (error) {
        console.error('Error sending webhook:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
