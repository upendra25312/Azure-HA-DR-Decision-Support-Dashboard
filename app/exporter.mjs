import { cleanValue, formatDate, isHiddenPublicSourceUrl } from "./utils.mjs";

function maturityMix(items) {
    return items.reduce((mix, item) => {
        mix[item.maturity] = (mix[item.maturity] || 0) + 1;
        return mix;
    }, {});
}

function sourceLines(item) {
    return visibleReferences(item)
        .map((reference) => `- ${reference.label}: ${reference.url}`)
        .join("\n");
}

function visibleReferences(item) {
    return item.references.filter((reference) => !isHiddenPublicSourceUrl(reference.url));
}

function flattenList(values) {
    return (values || [])
        .map((value) => cleanValue(value))
        .filter(Boolean)
        .join(" | ");
}

function csvValue(value) {
    const text = cleanValue(value).replace(/"/g, "\"\"");
    return `"${text}"`;
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
        "> Review surface exports are sample outputs. They do not create shared review records or audit events.",
        "",
        body
    ].join("\n");
}

export function buildCsvExport({
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

    const headers = [
        "productName",
        "mode",
        "exportedAtUtc",
        "itemCount",
        "maturityMix",
        "filters",
        "advisoryIncluded",
        "previewIncluded",
        "notesIncluded",
        "id",
        "title",
        "serviceName",
        "serviceFamily",
        "category",
        "severity",
        "maturity",
        "summary",
        "guardrail",
        "lastReviewedDate",
        "defaultExportPosture",
        "sourceName",
        "sourceUrl",
        "sourceLinks",
        "recommendedActions",
        "dependencies",
        "testGuidance",
        "localNote"
    ];

    const rows = items.map((item) => {
        const references = visibleReferences(item);
        return [
            productName,
            modeLabel,
            generatedAt.toISOString(),
            String(items.length),
            maturitySummary || "None",
            filtersSummary || "Default explorer view",
            options.includeAdvisory ? "Yes" : "No",
            options.includePreview ? "Yes" : "No",
            options.includeNotes ? "Yes" : "No",
            item.id,
            item.title,
            item.serviceName,
            item.serviceFamily,
            item.category,
            item.severity,
            item.maturity,
            item.summary,
            item.guardrail,
            formatDate(item.lastReviewedDate),
            item.exportEligible ? "Included by default" : "Requires explicit override",
            item.sourceName,
            item.sourceUrl,
            references.map((reference) => `${reference.label}: ${reference.url}`).join(" | ") || "Public source link withheld",
            flattenList(item.recommendedActions),
            flattenList(item.detail?.dependencies),
            flattenList(item.detail?.testGuidance),
            options.includeNotes ? cleanValue(item.localNote) : ""
        ];
    });

    return [
        headers.map(csvValue).join(","),
        ...rows.map((row) => row.map(csvValue).join(","))
    ].join("\n");
}

export function downloadTextFile(filename, content, mimeType = "text/plain;charset=utf-8") {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
