const querystring = require("querystring");
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method not allowed" }),
        };
    }

    let data;

    try {
        // Parse JSON or URL-encoded form data
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
                    { name: "How can you benefit Ofsted", value: benefit, inline: false },
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
        await fetch(webhookURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordMessage),
        });
    } catch (error) {
        console.error("Error sending webhook:", error.message);
    }

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
        service: "gmail", // Or your SMTP provider
        auth: {
            user: process.env.EMAIL_USERNAME, // Your email
            pass: process.env.EMAIL_PASSWORD, // App password
        },
    });

    // HTML Email Template
    const emailHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Application Received</title>
      </head>
      <body
        style="
          font-family: 'Frutiger', 'Gill Sans', 'Gill Sans MT', Calibri, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          text-align: center;
        ">
        <div
          style="
            max-width: 600px;
            background: white;
            margin: 50px auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
          ">
          <img src="https://iili.io/3xMiDhB.png" alt="Logo" style="width: 150px" />
          <h2>Application Received</h2>

          <div style="text-align: left; margin-top: 20px; padding: 0 20px">
            <p>Dear ${name},</p> 
            <p>
              Thank you for submitting your application. We have successfully
              received your submission and it is currently under review.
            </p>
            <p>
              Our team carefully assesses all applications, and we aim to provide a
              response as soon as possible. If you do not hear back within
              <span style="font-weight: bold">48 hours</span>, please ensure to
              check your email inbox (including spam or junk folders) for any
              updates.
            </p>
            <p>
              If you require further assistance or have any inquiries regarding your
              application status, you may open a support ticket in our
              communications server.
            </p>
            <p>Best regards,</p>
            <p><strong>Ofsted Roblox Team</strong></p>
          </div>

          <div
            style="
              font-size: 12px;
              color: gray;
              margin-top: 20px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            ">
            Ofsted Roblox © 2025
          </div>
        </div>
      </body>
    </html>`;

    // Send email
    const mailOptions = {
        from: '"Ofsted Roblox" <no-reply@ofstedroblox.com>', // Sender name
        to: email, // Recipient
        subject: `Application Received for ${jobTitle}`, // Subject
        html: emailHTML, // HTML content
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error.message);
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Application submitted successfully. Email sent." }),
    };
};
