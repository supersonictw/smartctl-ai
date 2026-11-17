import {createTransport} from "nodemailer";

export const transport = createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "25", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || "",
    } : undefined,
});

export interface SendMailParams {
    subject: string;
    text: string;
}

export function sendMail(params: SendMailParams) {
    const cc = process.env.SEND_EMAIL_CC?.trim() || undefined;
    const bcc = process.env.SEND_EMAIL_BCC?.trim() || undefined;

    return transport.sendMail({
        from: process.env.SEND_EMAIL_FROM || "SMARTctl-AI <noreply-smartctl-ai@localhost>",
        to: process.env.SEND_EMAIL_TO || "Administrator <root@localhost>",
        ...(cc ? { cc } : {}),
        ...(bcc ? { bcc } : {}),
        subject: params.subject,
        text: params.text,
    });
}
