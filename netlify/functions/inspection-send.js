const axios = require("axios");

exports.handler = async (event, context) => {
    const { discordUsername, inspectorName, inspectionResult, inspectionDocument } = JSON.parse(event.body);

    const webhookURL = process.env.DISCORD_WEBHOOK_URL3; // Ensure this is set in your environment variables

    const embed = {
        title: "New Inspection Results",
        fields: [
            { name: "School Name", value: discordUsername }, // You might want to replace this with actual school name
            { name: "School Owner", value: discordUsername }, // Replace with actual owner data if needed
            { name: "Member Count", value: "100" }, // Replace with actual member count if needed
            { name: "Inspection Result", value: inspectionResult },
            { name: "Inspector Name", value: inspectorName },
            { name: "Inspection Document", value: inspectionDocument }
        ],
        footer: {
            text: "Ofsted Inspection System"
        }
    };

    try {
        await axios.post(webhookURL, { embeds: [embed] });
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Inspection data sent successfully!" })
        };
    } catch (error) {
        console.error("Error sending to Discord webhook:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to send inspection data." })
        };
    }
};
