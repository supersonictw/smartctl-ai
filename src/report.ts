export type HealthStatus = "GOOD" | "WARNING" | "DANGER" | "UNKNOWN";

export interface SmartInspectReport {
    driveBasics: {
        dateChecked: string;
        model: string;
        serial: string;
        firmware: string;
        capacity: string;
    };
    analysis: {
        potentialIssues: string[];
        recommendedActions: string[];
    };
    summary: {
        overallHealthStatus: HealthStatus;
        briefAnalysis: string;
        temperature: string;
    };
    redAlert: {
        reallocatedSectorsCount: string;
        currentPendingSectorCount: string;
        uncorrectableSectorCount: string;
        readErrorRate: string;
    };
    yellowWarning: {
        unsafeShutdowns: string;
        percentageUsed: string;
        availableSpare: string;
        temperature: string;
    };
    info: {
        powerOnHours: string;
        powerCycleCount: string;
        totalHostWrites: string;
        totalHostReads: string;
    };
}

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return null;
}

function asString(value: unknown, fallback: string = "N/A"): string {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : fallback;
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    return fallback;
}

function asStringArray(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) {
        return fallback;
    }
    const items = value
        .map((item) => asString(item, ""))
        .filter((item) => item.length > 0);
    return items.length > 0 ? items : fallback;
}

function normalizeHealthStatus(value: unknown): HealthStatus {
    const normalized = asString(value, "").toUpperCase();
    if (normalized === "GOOD" || normalized === "WARNING" || normalized === "DANGER") {
        return normalized;
    }
    return "UNKNOWN";
}

function extractJsonText(rawReply: string): string {
    const trimmed = rawReply.trim();
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenceMatch) {
        return fenceMatch[1].trim();
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end > start) {
        return trimmed.slice(start, end + 1);
    }
    return trimmed;
}

/**
 * Parse an AI reply into a normalized SmartInspectReport, or null if not valid report JSON.
 */
export function parseInspectReport(rawReply: string): SmartInspectReport | null {
    const jsonText = extractJsonText(rawReply);
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonText);
    } catch {
        return null;
    }

    const root = asRecord(parsed);
    if (!root) {
        return null;
    }

    const driveBasics = asRecord(root.driveBasics);
    const analysis = asRecord(root.analysis);
    const summary = asRecord(root.summary);
    const redAlert = asRecord(root.redAlert);
    const yellowWarning = asRecord(root.yellowWarning);
    const info = asRecord(root.info);

    // Require at least some expected structure so unrelated JSON doesn't silently render empty
    if (!driveBasics && !summary && !redAlert && !yellowWarning && !info) {
        return null;
    }

    return {
        driveBasics: {
            dateChecked: asString(driveBasics?.dateChecked),
            model: asString(driveBasics?.model),
            serial: asString(driveBasics?.serial),
            firmware: asString(driveBasics?.firmware),
            capacity: asString(driveBasics?.capacity),
        },
        analysis: {
            potentialIssues: asStringArray(analysis?.potentialIssues, ["None detected."]),
            recommendedActions: asStringArray(analysis?.recommendedActions, ["Continue regular monitoring."]),
        },
        summary: {
            overallHealthStatus: normalizeHealthStatus(summary?.overallHealthStatus),
            briefAnalysis: asString(summary?.briefAnalysis),
            temperature: asString(summary?.temperature),
        },
        redAlert: {
            reallocatedSectorsCount: asString(redAlert?.reallocatedSectorsCount),
            currentPendingSectorCount: asString(redAlert?.currentPendingSectorCount),
            uncorrectableSectorCount: asString(redAlert?.uncorrectableSectorCount),
            readErrorRate: asString(redAlert?.readErrorRate),
        },
        yellowWarning: {
            unsafeShutdowns: asString(yellowWarning?.unsafeShutdowns),
            percentageUsed: asString(yellowWarning?.percentageUsed),
            availableSpare: asString(yellowWarning?.availableSpare),
            temperature: asString(yellowWarning?.temperature),
        },
        info: {
            powerOnHours: asString(info?.powerOnHours),
            powerCycleCount: asString(info?.powerCycleCount),
            totalHostWrites: asString(info?.totalHostWrites),
            totalHostReads: asString(info?.totalHostReads),
        },
    };
}

function formatKeyValueRows(rows: Array<[string, string]>, labelWidth: number = 34): string[] {
    return rows.map(([label, value]) => {
        const displayLen = [...label].reduce((acc, ch) => acc + (ch.charCodeAt(0) > 0x7f ? 2 : 1), 0);
        const padding = " ".repeat(Math.max(0, labelWidth - displayLen));
        return `   ${label}${padding} : ${value}`;
    });
}

function formatBulletList(items: string[]): string[] {
    return items.map((item) => `   - ${item}`);
}

interface ReportLabels {
    title: string;
    secBasics: string;
    dateChecked: string;
    model: string;
    serial: string;
    firmware: string;
    capacity: string;
    secSummary: string;
    overallHealth: string;
    briefAnalysis: string;
    temperature: string;
    secAnalysis: string;
    potentialIssues: string;
    recommendedActions: string;
    secRedAlert: string;
    reallocatedSectors: string;
    pendingSectors: string;
    uncorrectableSectors: string;
    readErrorRate: string;
    secYellowWarning: string;
    unsafeShutdowns: string;
    percentageUsed: string;
    availableSpare: string;
    temperatureLimit: string;
    secInfo: string;
    powerOnHours: string;
    powerCycleCount: string;
    totalHostWrites: string;
    totalHostReads: string;
}

const REPORT_LABELS: Record<"en" | "zh-TW" | "zh-CN" | "ja", ReportLabels> = {
    en: {
        title: "S.M.A.R.T. Health Status Live Report",
        secBasics: "1. Drive Basics",
        dateChecked: "Date Checked",
        model: "Model",
        serial: "Serial",
        firmware: "Firmware",
        capacity: "Capacity",
        secSummary: "2. Summary (At-a-Glance)",
        overallHealth: "Overall Health Status",
        briefAnalysis: "AI Brief Analysis",
        temperature: "Temperature",
        secAnalysis: "3. AI Full Analysis & Recommendations",
        potentialIssues: "Potential Issues:",
        recommendedActions: "Recommended Actions:",
        secRedAlert: "4. RED ALERT - Critical Errors (Should be 0)",
        reallocatedSectors: "[05] Reallocated Sectors Count",
        pendingSectors: "[C5] Current Pending Sector Count",
        uncorrectableSectors: "[C6] Uncorrectable Sector Count",
        readErrorRate: "[01] Read Error Rate",
        secYellowWarning: "5. YELLOW WARNING - Potential Issues",
        unsafeShutdowns: "Unsafe Shutdowns",
        percentageUsed: "Percentage Used (SSD)",
        availableSpare: "Available Spare",
        temperatureLimit: "Temperature (Limit < 70 C)",
        secInfo: "6. INFO - Drive Vitals",
        powerOnHours: "Power-On Hours",
        powerCycleCount: "Power Cycle Count",
        totalHostWrites: "Total Host Writes",
        totalHostReads: "Total Host Reads",
    },
    "zh-TW": {
        title: "S.M.A.R.T. 硬碟健康即時報告",
        secBasics: "1. 硬碟基本資訊",
        dateChecked: "檢測時間",
        model: "型號",
        serial: "序號",
        firmware: "韌體版本",
        capacity: "容量",
        secSummary: "2. 摘要 (一目了然)",
        overallHealth: "整體健康狀態",
        briefAnalysis: "AI 簡短分析",
        temperature: "溫度",
        secAnalysis: "3. AI 完整分析與建議",
        potentialIssues: "潛在問題:",
        recommendedActions: "建議採取行動:",
        secRedAlert: "4. 紅色警報 - 嚴重錯誤 (應為 0)",
        reallocatedSectors: "[05] 重新分配磁區計數",
        pendingSectors: "[C5] 目前待處理磁區數",
        uncorrectableSectors: "[C6] 無法修正磁區計數",
        readErrorRate: "[01] 讀取錯誤率",
        secYellowWarning: "5. 黃色警告 - 潛在風險",
        unsafeShutdowns: "異常斷電次數",
        percentageUsed: "已用壽命百分比 (SSD)",
        availableSpare: "剩餘備用空間",
        temperatureLimit: "溫度 (建議 < 70 C)",
        secInfo: "6. 資訊 - 硬碟運行狀態",
        powerOnHours: "通電時間",
        powerCycleCount: "通電次數",
        totalHostWrites: "主機總寫入量",
        totalHostReads: "主機總讀取量",
    },
    "zh-CN": {
        title: "S.M.A.R.T. 硬盘健康即时报告",
        secBasics: "1. 硬盘基本信息",
        dateChecked: "检测时间",
        model: "型号",
        serial: "序列号",
        firmware: "固件版本",
        capacity: "容量",
        secSummary: "2. 摘要 (一目了然)",
        overallHealth: "整体健康状态",
        briefAnalysis: "AI 简短分析",
        temperature: "温度",
        secAnalysis: "3. AI 完整分析与建议",
        potentialIssues: "潜在问题:",
        recommendedActions: "建议采取行动:",
        secRedAlert: "4. 红色警报 - 严重错误 (应为 0)",
        reallocatedSectors: "[05] 重分配扇区计数",
        pendingSectors: "[C5] 当前挂起扇区数",
        uncorrectableSectors: "[C6] 无法修正扇区计数",
        readErrorRate: "[01] 读取错误率",
        secYellowWarning: "5. 黄色警告 - 潜在风险",
        unsafeShutdowns: "异常断电次数",
        percentageUsed: "已用寿命百分比 (SSD)",
        availableSpare: "剩余备用空间",
        temperatureLimit: "温度 (建议 < 70 C)",
        secInfo: "6. 信息 - 硬盘运行状态",
        powerOnHours: "通电时间",
        powerCycleCount: "通电次数",
        totalHostWrites: "主机总写入量",
        totalHostReads: "主机总读取量",
    },
    ja: {
        title: "S.M.A.R.T. 健全性ライブレポート",
        secBasics: "1. ドライブ基本情報",
        dateChecked: "検査日時",
        model: "モデル",
        serial: "シリアル番号",
        firmware: "ファームウェア",
        capacity: "容量",
        secSummary: "2. サマリー",
        overallHealth: "総合健全性ステータス",
        briefAnalysis: "AI 簡易分析",
        temperature: "温度",
        secAnalysis: "3. AI 詳細分析と推奨事項",
        potentialIssues: "潜在的な問題:",
        recommendedActions: "推奨アクション:",
        secRedAlert: "4. RED ALERT - 重大エラー (0 であるべき項目)",
        reallocatedSectors: "[05] 代替処理済セクタ数",
        pendingSectors: "[C5] 代替処理保留中セクタ数",
        uncorrectableSectors: "[C6] 回復不能セクタ数",
        readErrorRate: "[01] リードエラーレート",
        secYellowWarning: "5. YELLOW WARNING - 注意項目",
        unsafeShutdowns: "異常シャットダウン回数",
        percentageUsed: "使用率 (SSD)",
        availableSpare: "予備領域残量",
        temperatureLimit: "温度 (目安 < 70 C)",
        secInfo: "6. INFO - ドライブ稼働状況",
        powerOnHours: "通電時間",
        powerCycleCount: "電源投入回数",
        totalHostWrites: "総ホスト書き込み量",
        totalHostReads: "総ホスト読み込み量",
    },
};

function resolveReportLabels(chatLanguage?: string): ReportLabels {
    const lang = (chatLanguage || "en").trim().toLowerCase().replace(/_/g, "-");
    if (lang === "zh-tw" || lang === "zh-hk" || lang === "zh-hant" || lang.includes("traditional")) {
        return REPORT_LABELS["zh-TW"];
    }
    if (lang === "zh-cn" || lang === "zh-sg" || lang === "zh-hans" || lang.includes("simplified")) {
        return REPORT_LABELS["zh-CN"];
    }
    if (lang === "ja" || lang === "ja-jp" || lang.includes("japanese")) {
        return REPORT_LABELS.ja;
    }
    return REPORT_LABELS.en;
}

/**
 * Render a SmartInspectReport into a fixed, deterministic plain-text report.
 */
export function formatInspectReport(report: SmartInspectReport, chatLanguage?: string): string {
    const L = resolveReportLabels(chatLanguage);
    const lines: string[] = [
        L.title,
        L.secBasics,
        ...formatKeyValueRows([
            [L.dateChecked, report.driveBasics.dateChecked],
            [L.model, report.driveBasics.model],
            [L.serial, report.driveBasics.serial],
            [L.firmware, report.driveBasics.firmware],
            [L.capacity, report.driveBasics.capacity],
        ]),
        "",
        L.secSummary,
        ...formatKeyValueRows([
            [L.overallHealth, report.summary.overallHealthStatus],
            [L.briefAnalysis, report.summary.briefAnalysis],
            [L.temperature, report.summary.temperature],
        ]),
        "",
        L.secAnalysis,
        `   ${L.potentialIssues}`,
        ...formatBulletList(report.analysis.potentialIssues),
        `   ${L.recommendedActions}`,
        ...formatBulletList(report.analysis.recommendedActions),
        "",
        L.secRedAlert,
        ...formatKeyValueRows([
            [L.reallocatedSectors, report.redAlert.reallocatedSectorsCount],
            [L.pendingSectors, report.redAlert.currentPendingSectorCount],
            [L.uncorrectableSectors, report.redAlert.uncorrectableSectorCount],
            [L.readErrorRate, report.redAlert.readErrorRate],
        ]),
        "",
        L.secYellowWarning,
        ...formatKeyValueRows([
            [L.unsafeShutdowns, report.yellowWarning.unsafeShutdowns],
            [L.percentageUsed, report.yellowWarning.percentageUsed],
            [L.availableSpare, report.yellowWarning.availableSpare],
            [L.temperatureLimit, report.yellowWarning.temperature],
        ]),
        "",
        L.secInfo,
        ...formatKeyValueRows([
            [L.powerOnHours, report.info.powerOnHours],
            [L.powerCycleCount, report.info.powerCycleCount],
            [L.totalHostWrites, report.info.totalHostWrites],
            [L.totalHostReads, report.info.totalHostReads],
        ]),
    ];

    return lines.join("\n");
}
