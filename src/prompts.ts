import {
    type ChatMessage,
} from "./chat.ts";

export interface GenerateInspectMessageParams {
    chatLanguage: string;
    isSendEmail: boolean;
    isColorTerminal: boolean;
}

export const generateInspectSystemMessage = (params: GenerateInspectMessageParams): ChatMessage => {
    const languageRule = params.chatLanguage
        ? `Write all descriptive text values (briefAnalysis, potentialIssues, recommendedActions) in ${params.chatLanguage}.`
        : "Write all descriptive text values in English.";

    const prompt = `You are a storage hardware diagnostics assistant analyzing raw smartctl output.

Key Instructions:
- Output ONLY a single valid JSON object matching the exact schema below. Do NOT include markdown code fences (\`\`\`), extra commentary, or any text outside the JSON object.
- Never use markdown formatting (*, _, \`, #) inside any JSON string value.
- Priority: Highlight any abnormal values in the RED ALERT and YELLOW WARNING fields first in potentialIssues and briefAnalysis.
- Missing attributes: If a field or SMART attribute is not present in the raw data (for example, NVMe-only fields on an HDD or ATA-only IDs on an NVMe SSD), set its value to "N/A". Never guess or fabricate numbers.
- overallHealthStatus must be strictly one of: "GOOD", "WARNING", or "DANGER".
- ${languageRule}

Required JSON Schema:
{
  "driveBasics": {
    "dateChecked": "string (timestamp from smartctl output or N/A)",
    "model": "string",
    "serial": "string",
    "firmware": "string",
    "capacity": "string"
  },
  "summary": {
    "overallHealthStatus": "GOOD | WARNING | DANGER",
    "briefAnalysis": "string (concise 1-2 sentence summary)",
    "temperature": "string (e.g. '38 C' or '38 C (Sensor 1) / 41 C (Sensor 2)' or 'N/A')"
  },
  "analysis": {
    "potentialIssues": ["string (list of detected issues, or a single entry stating none detected)"],
    "recommendedActions": ["string (actionable next steps based on findings)"]
  },
  "redAlert": {
    "reallocatedSectorsCount": "string (ID 05 raw value or N/A)",
    "currentPendingSectorCount": "string (ID C5 raw value or N/A)",
    "uncorrectableSectorCount": "string (ID C6 raw value or N/A)",
    "readErrorRate": "string (ID 01 raw value or N/A)"
  },
  "yellowWarning": {
    "unsafeShutdowns": "string (raw value or N/A)",
    "percentageUsed": "string (e.g. '3 %' or N/A)",
    "availableSpare": "string (e.g. '100 %' or N/A)",
    "temperature": "string (e.g. '38 C' or N/A)"
  },
  "info": {
    "powerOnHours": "string (e.g. '4210 hours' or N/A)",
    "powerCycleCount": "string (raw value or N/A)",
    "totalHostWrites": "string (formatted size/units or N/A)",
    "totalHostReads": "string (formatted size/units or N/A)"
  }
}`;

    return {
        role: "system",
        content: prompt.trim(),
    };
}

export interface GenerateInspectUserMessageParams {
    chatLanguage: string;
}

export const generateInspectUserMessage = (params: GenerateInspectUserMessageParams): ChatMessage => {
    return {
        role: "user",
        content: `Please analyze the above SMART data and provide insights or potential issues in ${params.chatLanguage}.`,
    };
}

export interface GenerateSummaryMessageParams {
    chatLanguage: string;
}

export const generateSummaryUserMessage = (params: GenerateSummaryMessageParams): ChatMessage => {
    return {
        role: "user",
        content: `Please provide a concise summary of the inspection reports above in ${params.chatLanguage}, highlighting any critical issues or recommendations.`,
    };
}
