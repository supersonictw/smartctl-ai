import 'dotenv/config';

import {
    sendMail,
} from "./src/mailer.ts";

// Load configuration from environment variables or use default values
const isSendEmail = process.env.SEND_EMAIL === 'true';
const mailContent = process.env.MAIL_CONTENT || "This is a test email from SMARTctl-AI.";

// Send email if configured
if (!isSendEmail) {
    throw new Error("Email sending is not enabled. Set SEND_EMAIL=true to enable.");
}

// Send notification email
try {
    await sendMail({
        subject: "SMARTctl-AI Notification Email",
        text: mailContent,
    });
    console.info("Notification email sent successfully.");
} catch (error: any) {
    console.error(`Failed to send email:`, error?.message ?? 'Unknown error');
}
