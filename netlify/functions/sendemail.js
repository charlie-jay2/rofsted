const nodemailer = require("nodemailer");

exports.handler = async (event, context) => {
    if (event.httpMethod === "POST") {
        const { name, email, message } = JSON.parse(event.body);

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "ofstedrobloxofficial@gmail.com",
                pass: "Dbzbhcma7!?!$$", // Use OAuth2 for added security
            },
        });

        let mailOptions = {
            from: "ofstedrobloxofficial@gmail.com",
            to: email, // You can set this to send to a fixed address or user-provided email
            subject: "Application Received",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; text-align: center; font-family: Arial, sans-serif;">
    <!-- Background Wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <!-- Email Container -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: white; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); padding: 20px;">
                    
                    <!-- Logo -->
                    <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <img src="https://i.postimg.cc/SN1DM0QC/download.png" alt="Ofsted Roblox Logo" width="150">
                        </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                        <td align="center" style="font-size: 22px; font-weight: bold; color: #333; padding-bottom: 10px;">
                            Application Received
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td align="left" style="font-size: 16px; color: #333; padding: 0 20px;">
                            <p>Dear Applicant,</p>
                            <p>Thank you for submitting your application. We have successfully received your submission and it is currently under review.</p>
                            <p>Our team carefully assesses all applications, and we aim to provide a response as soon as possible. If you do not hear back within <strong>48 hours</strong>, please ensure to check your email inbox (including spam or junk folders) for any updates.</p>
                            <p>If you require further assistance or have any inquiries regarding your application status, you may open a support ticket in our communications server.</p>
                            <p>Best regards,</p>
                            <p><strong>Ofsted Roblox Team</strong></p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="font-size: 12px; color: gray; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px;">
                            Ofsted Roblox © 2025
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
      `,
        };

        try {
            await transporter.sendMail(mailOptions);
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Email sent successfully" }),
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Failed to send email" }),
            };
        }
    }
    return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
    };
};
