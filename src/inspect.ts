import { exec } from "node:child_process";
import { promisify } from "node:util";

import {
    chatWithAI,
    sliceContent,
    type ChatMessage,
} from "./chat.ts";

import {
    formatInspectReport,
    parseInspectReport,
} from "./report.ts";

const execAsync = promisify(exec);

// Define the inspect method
export interface InspectParams {
    devicePath: string;
    chatModel: string;
    chatLanguage?: string;
    systemMessage: ChatMessage;
    userMessage: ChatMessage;
}

export interface InspectResult {
    smartctlOutput: string;
    reply: string;
}

export const inspect = async (params: InspectParams): Promise<InspectResult> => {
    let smartctlResult;
    try {
        const process = await execAsync(`smartctl -a "${params.devicePath}"`);
        smartctlResult = process.stdout;
    } catch (e: any) {
        smartctlResult = e.stdout;
    }

    const smartctlOutput = smartctlResult.toString();
    const snippets = sliceContent(smartctlOutput, 2000, "\n");

    const chatHistory: ChatMessage[] = [
        params.systemMessage,
        ...snippets.map((snippet) => ({
            role: "user",
            content: snippet,
        })),
    ];

    const rawReply = await chatWithAI(
        chatHistory,
        params.chatModel,
        params.userMessage,
    );

    const parsedReport = parseInspectReport(rawReply);
    const reply = parsedReport
        ? formatInspectReport(parsedReport, params.chatLanguage)
        : rawReply;

    return {
        smartctlOutput,
        reply,
    };
}
