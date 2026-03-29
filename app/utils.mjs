export function cleanValue(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
}

export function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function slugify(value) {
    return cleanValue(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function formatDate(value) {
    const cleaned = cleanValue(value);

    if (!cleaned) {
        return "Not dated";
    }

    const parsed = new Date(cleaned);

    if (Number.isNaN(parsed.getTime())) {
        return cleaned;
    }

    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(parsed);
}

export function uniqueValues(rows, key) {
    return [...new Set(rows.map((row) => cleanValue(row[key])).filter(Boolean))]
        .sort((left, right) => left.localeCompare(right));
}

export function canonicalizeServiceName(value) {
    const cleaned = cleanValue(value).toLowerCase();

    const aliases = {
        "application gateway": "Azure Application Gateway",
        "azure application gateway": "Azure Application Gateway",
        "azure key vault": "Azure Key Vault",
        "load balancer": "Azure Load Balancer",
        "azure load balancer": "Azure Load Balancer"
    };

    return aliases[cleaned] || cleanValue(value);
}

export function parseCsvLine(line) {
    const values = [];
    let current = "";
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        const nextCharacter = line[index + 1];

        if (character === "\"") {
            if (inQuotes && nextCharacter === "\"") {
                current += "\"";
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (character === "," && !inQuotes) {
            values.push(current.trim());
            current = "";
        } else {
            current += character;
        }
    }

    values.push(current.trim());
    return values;
}

export function parseCSV(text) {
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);

    if (!lines.length) {
        return [];
    }

    const headers = parseCsvLine(lines[0]);

    return lines.slice(1).map((line) => {
        const values = parseCsvLine(line);
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || "";
        });

        return row;
    });
}

export function splitToSentences(value) {
    return cleanValue(value)
        .split(/(?<=[.!?])\s+/)
        .map((segment) => cleanValue(segment))
        .filter(Boolean);
}

export function sentenceList(value, limit = 3) {
    return splitToSentences(value).slice(0, limit);
}

export function listFromDelimited(value) {
    return cleanValue(value)
        .split(/[,;]|\band\b/i)
        .map((segment) => cleanValue(segment))
        .filter(Boolean);
}

export function summarizeCount(items, label) {
    return `${items} ${label}${items === 1 ? "" : "s"}`;
}

export function isHiddenPublicSourceUrl(value) {
    const cleaned = cleanValue(value).toLowerCase();

    if (!cleaned) {
        return false;
    }

    return cleaned.startsWith("https://github.com/azure/review-checklists")
        || cleaned.startsWith("http://github.com/azure/review-checklists")
        || cleaned.startsWith("https://www.github.com/azure/review-checklists")
        || cleaned.startsWith("http://www.github.com/azure/review-checklists");
}
