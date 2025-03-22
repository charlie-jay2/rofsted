const express = require("express");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");
const querystring = require("querystring");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Discord Webhook URL
const webhookURL = process.env.DISCORD_WEBHOOK_URL;

// API Endpoint for handling applications
app.post("/submit-application", async (req, res) => {
    let data;

    try {
        // Handle different content types
        if (req.headers["content-type"] === "application/json") {
            data = req.body;
        } else if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
            data = querystring.parse(req.body);
        } else {
            throw new Error("Unsupported content type");
        }
    } catch (error) {
        console.error("Parsing error:", error.message);
        return res.status(400).json({ success: false, message: "Invalid input format." });
    }

    const { name, email, benefit, doas, manage, bring, jobTitle, resume } = data;

    if (!name || !email || !jobTitle || !resume || !benefit || !doas || !manage || !bring) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Construct Discord Webhook Payload
    const discordMessage = {
        content: null,
        embeds: [
            {
                title: `New Application for ${jobTitle}`,
                fields: [
                    { name: "Name", value: name, inline: false },
                    { name: "Email", value: email, inline: false },
                    { name: "How can you benefit Ofsted?", value: benefit, inline: false },
                    { name: "What can you do as an Inspector?", value: doas, inline: false },
                    { name: "How can you manage investigations?", value: manage, inline: false },
                    { name: "What would you bring to Ofsted?", value: bring, inline: false },
                    { name: "Resume", value: resume, inline: false },
                ],
                color: 5814783,
            },
        ],
    };

    // Construct Email HTML Template
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Application Received</title>
    </head>
    <body style="font-family: 'Frutiger', 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; text-align: center;">
        <div style="max-width: 600px; background: white; margin: 50px auto; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
            <img src="https://iili.io/3xMiDhB.png" alt="Logo" style="width: 150px" />
            <h2>Application Received</h2>
            <div style="text-align: left; margin-top: 20px; padding: 0 20px">
                <p>Dear ${name},</p> 
                <p>Thank you for submitting your application. We have successfully received your submission and it is currently under review.</p>
                <p>Our team carefully assesses all applications, and we aim to provide a response as soon as possible. If you do not hear back within <span style="font-weight: bold">48 hours</span>, please check your email inbox (including spam or junk folders) for any updates.</p>
                <p>If you require further assistance or have any inquiries regarding your application status, you may open a support ticket in our communications server.</p>
                <p>Best regards,</p>
                <p><strong>Ofsted Roblox Team</strong></p>
            </div>
            <div style="font-size: 12px; color: gray; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px;">
                Ofsted Roblox © 2025
            </div>
        </div>
    </body>
    </html>
    `;

    // Configure Email Options
    const mailOptions = {
        from: `"Ofsted Roblox" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: `Application Received for ${jobTitle}`,
        html: emailHTML,
    };

    try {
        // Send Discord Webhook
        const webhookResponse = await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordMessage),
        });

        if (!webhookResponse.ok) {
            throw new Error("Failed to send Discord message");
        }

        // Send Email Notification
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "Application submitted successfully." });
    } catch (error) {
        console.error("Error processing request:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Start the Express Server
app.listen(8888, () => console.log("Server running on port 8888"));
