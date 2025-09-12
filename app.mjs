#!/usr/bin/node

import {
    execSync,
} from "node:child_process";

import {
    chatWithAI,
    sliceContent,
} from "./chat.mjs";

const stdOut = execSync("smartctl --scan-open");
const devicePaths = stdOut.toString().trim().split("\n").map(line => {
    const parts = line.split(" ");
    return parts[0];
});

const chatHistory = [];
const chatModel = process.env.CHAT_MODEL || "gemini-2.0-flash";
const chatLanguage = process.env.CHAT_LANGUAGE || "zh-TW";
const isSendEmail = !!process.env.SEND_EMAIL;
const isColorTerminal = !process.env.NO_COLOR && !process.env.SEND_EMAIL;

const inspectPrompt =
    `Analyze the following SMART data and provide insights or potential issues in ${chatLanguage}.\n` +
    (isSendEmail ? 
        "Output in plain text format suitable for email. Do NOT use asterisks (*), underscores (_), backticks (`), or any markdown syntax. Use only line breaks, spaces, and basic punctuation for formatting.\n" :
        "CRITICAL: Output must be pure plain text only. NEVER use asterisks (*), underscores (_), backticks (`), hash symbols (#), or any markdown formatting. Use only regular text with basic punctuation.\n") +
    (isColorTerminal ? "Make response in terminal style with colors if possible.\n" : "");
const inspect = async (device) => {
    let smartctlResult;

    try {
        smartctlResult = execSync(`smartctl -a "${device}"`);
    } catch (e) {
        smartctlResult = e.stdout;
    }

    const smartctlOutput = smartctlResult.toString();
    const snippets = sliceContent(smartctlOutput, 2000, "\n");
    for (const snippet of snippets) {
        chatHistory.push({
            role: "user",
            content: snippet,
        });
    }

    chatHistory.push({
        role: "system",
        content: inspectPrompt,
    });

    try {
        const prompt = "Please analyze the above SMART data.";
        const reply = await chatWithAI(chatHistory, chatModel, prompt);
        console.info(reply);
    } catch (error) {
        console.error("Error communicating with AI:", error);
    }
}

console.info("Detected devices:", devicePaths);

for (const devicePath of devicePaths) {
    console.info(`\n=== Device: ${devicePath} ===\n`);
    try {
        await inspect(devicePath);
    } catch (error) {
        console.error(`Error reading SMART data for device ${devicePath}:`, error.message);
    }
}
