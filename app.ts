#!/usr/bin/node

import 'dotenv/config';

import {
    hostname,
} from "node:os";

import {
    chatWithAI,
    type ChatMessage,
} from "./src/chat.ts";

import {
    deviceList,
} from "./src/devices.ts";

import {
    inspect,
} from "./src/inspect.ts";

import {
    generateInspectSystemMessage,
    generateInspectUserMessage,
    generateSummaryUserMessage,
} from "./src/prompts.ts";

import {
    sendMail,
} from "./src/mailer.ts";

// Load configuration from environment variables or use default values
const chatModel = process.env.CHAT_MODEL || "gemini-2.0-flash";
const chatLanguage = process.env.CHAT_LANGUAGE || "zh-TW";

const isSendEmail = process.env.SEND_EMAIL === 'true';
const isColorTerminal = process.env.NO_COLOR !== 'true' && !isSendEmail;

// Fetch hostname
const hostnameStr = hostname();

// Fetch device paths
const devices = deviceList.find(
    (method) => method.type === "all",
);
const devicePaths = devices ? await devices.fetch() : [];
if (!devicePaths || devicePaths.length === 0) {
    console.error("No storage devices detected.");
    process.exit(1);
}

// SMART history for summary
const smartHistory: string[] = [];

// Log detected devices
console.info("Detected devices:", devicePaths);

// Store reply messages for output and email
const replyMessages: string[] = [];

// Inspect each device
{
    console.info(`Starting inspections for host: ${hostnameStr}...`);

    // Generate prompts
    const systemMessage = generateInspectSystemMessage({
        chatLanguage,
        isSendEmail,
        isColorTerminal,
    });
    const userMessage = generateInspectUserMessage({
        chatLanguage,
    });

    // Inspect each device
    for (const devicePath of devicePaths) {
        replyMessages.push(`\n=== Device: ${devicePath} ===\n`);
        try {
            console.info(`Starting inspection for device ${devicePath}...`);
            const {
                reply, smartctlOutput,
            } = await inspect({devicePath, chatModel, chatLanguage, systemMessage, userMessage});
            replyMessages.push(`Inspection report for device ${devicePath}:\n`, reply);
            smartHistory.push(smartctlOutput);
            console.info(`Inspection completed for device ${devicePath}.`);
        } catch (error: any) {
            console.error(`Error reading SMART data for device ${devicePath}:`, error.message);
        }
    }
}

{
    console.info("Generating summary of all inspections...");

    // Generate prompts
    const userMessage = generateSummaryUserMessage({
        chatLanguage,
    });
    
    // Summary of all inspections
    if (replyMessages.length === 0) {
        console.info("No inspection reports available.");
        replyMessages.unshift("No inspection reports available.");
    } else {
        console.info("Generating inspection summary...");
        const inspectChatHistory = smartHistory.map((output) => ({
            role: "user",
            content: output,
        }));
        const replySummary = await chatWithAI(inspectChatHistory, chatModel, userMessage);
        replyMessages.unshift("Inspection Summary:\n", replySummary);
        console.info("Summary generation completed.");
    }

    // Add header for summary
    replyMessages.unshift(`\n=== Inspection Summary for Host: ${hostnameStr} ===\n`);
}

// Output to console
console.info(replyMessages.join("\n"));

// Send email if configured
if (isSendEmail) {
    // Send notification email
    try {
        await sendMail({
            subject: `SMARTctl-AI - SMART Inspection Report for ${hostnameStr}`,
            text: replyMessages.join("\n") || "No inspection reports available.",
        });
        console.info(`Inspection report for ${hostnameStr} has been sent via email.`);
    } catch (error: any) {
        console.error(`Failed to send email for ${hostnameStr}:`, error?.message ?? 'Unknown error');
    }
}
