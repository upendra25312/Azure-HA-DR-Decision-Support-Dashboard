import { cleanValue, formatDate, isHiddenPublicSourceUrl } from "./utils.mjs";

function maturityMix(items) {
    return items.reduce((mix, item) => {
        mix[item.maturity] = (mix[item.maturity] || 0) + 1;
        return mix;
    }, {});
}

function sourceLines(item) {
    return item.references
        .filter((reference) => !isHiddenPublicSourceUrl(reference.url))
        .map((reference) => `- ${reference.label}: ${reference.url}`)
        .join("\n");
}

export function buildMarkdownExport({
    productName,
    modeLabel,
    items,
    filters,
    options,
    generatedAt
}) {
    const mix = maturityMix(items);
    const maturitySummary = Object.entries(mix)
        .map(([maturity, count]) => `${maturity}: ${count}`)
        .join(", ");
    const filtersSummary = Object.entries(filters)
        .filter(([, value]) => {
            if (Array.isArray(value)) {
                return value.length > 0;
            }

            return cleanValue(value).length > 0;
        })
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
        .join(" | ");

    const body = items.map((item) => [
        `## ${item.title}`,
        "",
        `- Service: ${item.serviceName}`,
        `- Family: ${item.serviceFamily}`,
        `- Category: ${item.category}`,
        `- Severity: ${item.severity}`,
        `- Maturity: ${item.maturity}`,
        `- Last reviewed: ${formatDate(item.lastReviewedDate)}`,
        `- Default export posture: ${item.exportEligible ? "Included by default" : "Requires explicit override"}`,
        "",
        item.summary,
        "",
        "### Review guardrail",
        item.guardrail,
        "",
        "### Source traceability",
        sourceLines(item) || "- Public source link withheld",
        "",
        "### Local notes",
        options.includeNotes && cleanValue(item.localNote) ? item.localNote : "No local note included.",
        ""
    ].join("\n")).join("\n");

    return [
        `# ${productName} sample export`,
        "",
        `- Mode: ${modeLabel}`,
        `- Generated: ${formatDate(generatedAt.toISOString())}`,
        `- Item count: ${items.length}`,
        `- Maturity mix: ${maturitySummary || "None"}`,
        `- Filters: ${filtersSummary || "Default explorer view"}`,
        `- Advisory included: ${options.includeAdvisory ? "Yes" : "No"}`,
        `- Preview included: ${options.includePreview ? "Yes" : "No"}`,
        `- Deprecated included: No`,
        "",
        "> Public demo exports are sample outputs. They do not create shared review records or audit events.",
        "",
        body
    ].join("\n");
}

export function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
