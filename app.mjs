#!/usr/bin/node

import {
    execSync,
} from "node:child_process";

import {
    chatWithAI,
    sliceContent,
} from "./chat.mjs";

const stdOut = execSync("smartctl --scan-open");
const devices = stdOut.toString().trim().split("\n").map(line => {
    const parts = line.split(" ");
    const device = parts[0];
    const deviceType = parts[1]; // -d nvme, -d ata, etc.
    return { device, deviceType };
});

console.log("Detected devices:", devices);

const chatHistory = [];
const chatModel = "gemini-2.0-flash";

for (const deviceInfo of devices) {
    const { device, deviceType } = deviceInfo;
    console.log(`\n=== Device: ${device} ===\n`);

    try {
        const smartctlOutput = execSync(`smartctl -a "${device}" ${deviceType}`).toString();
        const snippets = sliceContent(smartctlOutput, 2000, "\n");

        for (const snippet of snippets) {
            const prompt = `Analyze the following SMART data and provide insights or potential issues:\n\n${snippet}`;
            try {
                const reply = await chatWithAI(chatHistory, chatModel, prompt);
                console.log(reply);
            } catch (error) {
                console.error("Error communicating with AI:", error);
            }
        }
    } catch (error) {
        console.error(`Error reading SMART data for device ${device}:`, error.message);
    }
}
