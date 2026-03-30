import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MATURITY_CONFIG, REVIEW_META } from "../app/data/reviewMeta.mjs";
import {
    canonicalizeServiceName,
    cleanValue,
    extractHttpUrls,
    listFromDelimited,
    parseCSV,
    sentenceList,
    slugify
} from "../app/utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const CHECKLIST_DIR = path.join(ROOT, "review-checklists", "checklists");
const RESEARCH_PATH = path.join(ROOT, "data", "research_knowledge_base.csv");
const SOURCE_PATH = path.join(ROOT, "data", "source_register.csv");
const OUTPUT_PATH = path.join(ROOT, "data", "generated", "review-catalog.json");
const IGNORE_SERVICES = new Set(["", "n/a", "na"]);
const SEVERITY_ORDER = ["High", "Medium", "Low"];
const FAMILY_OVERRIDES = {
    "Active Directory Domain Services": "Identity, Security, and Platform Dependencies",
    "API Management": "Integration and Messaging",
    "Azure AD B2C": "Identity, Security, and Platform Dependencies",
    "Azure AI Content Safety": "AI / Platform Services",
    "Azure AI Foundry": "AI / Platform Services",
    "Azure AI Search": "AI / Platform Services",
    "Azure AI Services": "AI / Platform Services",
    "Azure Backup": "Identity, Security, and Platform Dependencies",
    "Azure Bot Service": "AI / Platform Services",
    "Azure Cost Management": "Identity, Security, and Platform Dependencies",
    "Azure Container Apps": "Compute",
    "Azure Container Registry": "Compute",
    "Azure Device Provisioning Service": "Integration and Messaging",
    "Azure Databricks": "Storage and Data Services",
    "Azure Data Explorer": "Storage and Data Services",
    "Azure Data Factory": "Storage and Data Services",
    "Azure DevOps": "Identity, Security, and Platform Dependencies",
    "Azure DNS": "Identity, Security, and Platform Dependencies",
    "Azure Event Hubs": "Integration and Messaging",
    "Azure ExpressRoute": "Identity, Security, and Platform Dependencies",
    "Azure Front Door": "Identity, Security, and Platform Dependencies",
    "Azure IoT Hub": "Integration and Messaging",
    "Azure Kubernetes Service (AKS)": "Compute",
    "Azure Logic Apps": "Integration and Messaging",
    "Azure Machine Learning": "AI / Platform Services",
    "Azure Monitor": "Identity, Security, and Platform Dependencies",
    "Azure OpenAI": "AI / Platform Services",
    "Azure Policy": "Identity, Security, and Platform Dependencies",
    "Azure Public IP": "Identity, Security, and Platform Dependencies",
    "Azure RBAC": "Identity, Security, and Platform Dependencies",
    "Azure Resource Manager": "Identity, Security, and Platform Dependencies",
    "Azure Route Server": "Identity, Security, and Platform Dependencies",
    "Azure Service Fabric": "Compute",
    "Azure Site Recovery": "Identity, Security, and Platform Dependencies",
    "Azure Spring Apps": "Compute",
    "Azure SQL Database": "Databases",
    "Azure Stack HCI": "Compute",
    "Azure Storage Account": "Storage and Data Services",
    "Azure Synapse Analytics": "Storage and Data Services",
    "Azure Traffic Manager": "Identity, Security, and Platform Dependencies",
    "Azure Virtual Machine Scale Sets": "Compute",
    "Azure Virtual Machines": "Compute",
    "Azure Virtual Network": "Identity, Security, and Platform Dependencies",
    "Azure Virtual WAN": "Identity, Security, and Platform Dependencies",
    "Azure VPN Gateway": "Identity, Security, and Platform Dependencies",
    "Azure VMware Solution": "Compute",
    "Device Update for IoT Hub": "Integration and Messaging",
    "Microsoft Cloud Security Benchmark": "Identity, Security, and Platform Dependencies",
    "Microsoft Defender for Cloud": "Identity, Security, and Platform Dependencies",
    "Microsoft Entra ID": "Identity, Security, and Platform Dependencies",
    "Microsoft Fabric": "Storage and Data Services",
    "Microsoft Purview": "Storage and Data Services",
    "Microsoft Threat Modeling Tool": "Identity, Security, and Platform Dependencies",
    "Network Security Groups": "Identity, Security, and Platform Dependencies",
    "Network Virtual Appliance": "Identity, Security, and Platform Dependencies",
    "On-premises Data Gateway": "Integration and Messaging",
    "SAP on Azure": "Business Applications",
    "Web Application Firewall": "Identity, Security, and Platform Dependencies"
};
const CATEGORY_OVERRIDES = {
    "Active Directory Domain Services": "Directory service",
    "API Management": "API gateway",
    "Azure AD B2C": "Identity platform",
    "Azure AI Content Safety": "AI safety service",
    "Azure AI Foundry": "AI platform",
    "Azure AI Search": "Search platform",
    "Azure AI Services": "AI platform",
    "Azure Backup": "Backup and recovery",
    "Azure Bot Service": "Conversational AI",
    "Azure Cache for Redis": "Caching service",
    "Azure Cost Management": "Cost governance",
    "Azure Container Apps": "Application platform",
    "Azure Container Registry": "Container registry",
    "Azure Databricks": "Analytics platform",
    "Azure Data Explorer": "Analytics database",
    "Azure Data Factory": "Data integration",
    "Azure DevOps": "Engineering platform",
    "Azure Device Provisioning Service": "IoT operations",
    "Azure DNS": "DNS service",
    "Azure Event Hubs": "Event streaming",
    "Azure ExpressRoute": "Hybrid connectivity",
    "Azure Front Door": "Global ingress",
    "Azure IoT Hub": "IoT platform",
    "Azure Kubernetes Service (AKS)": "Managed Kubernetes",
    "Azure Logic Apps": "Workflow orchestration",
    "Azure Machine Learning": "AI platform",
    "Azure Monitor": "Monitoring and observability",
    "Azure Database for MySQL": "Database",
    "Azure Database for PostgreSQL": "Database",
    "Azure OpenAI": "AI inference",
    "Azure Policy": "Governance control",
    "Azure Public IP": "Network endpoint",
    "Azure RBAC": "Access control",
    "Azure Resource Manager": "Control plane",
    "Azure Route Server": "Network routing",
    "Azure Service Health": "Service health",
    "Azure Service Fabric": "Application platform",
    "Azure Site Recovery": "Disaster recovery",
    "Azure Spring Apps": "Application platform",
    "Azure SQL Database": "Database",
    "Azure Stack HCI": "Infrastructure platform",
    "Azure Storage Account": "Storage",
    "Azure Synapse Analytics": "Analytics platform",
    "Azure Traffic Manager": "Global traffic management",
    "Azure Virtual Machine Scale Sets": "Infrastructure scaling",
    "Azure Virtual Machines": "Infrastructure",
    "Azure Virtual Network": "Network foundation",
    "Azure Virtual WAN": "Transit networking",
    "Azure VPN Gateway": "Hybrid connectivity",
    "Azure VMware Solution": "Virtualization platform",
    "Device Update for IoT Hub": "IoT operations",
    "Microsoft Cloud Security Benchmark": "Security benchmark",
    "Microsoft Defender for Cloud": "Cloud security posture",
    "Microsoft Entra ID": "Identity platform",
    "Microsoft Fabric": "Analytics platform",
    "Microsoft Purview": "Data governance",
    "Microsoft Threat Modeling Tool": "Security modeling",
    "Network Security Groups": "Network security",
    "Network Virtual Appliance": "Network security",
    "On-premises Data Gateway": "Data connectivity",
    "SAP on Azure": "Business application",
    "Web Application Firewall": "Application security"
};

async function main() {
    const [researchText, sourceText, checklistFiles] = await Promise.all([
        fs.readFile(RESEARCH_PATH, "utf8"),
        fs.readFile(SOURCE_PATH, "utf8"),
        fs.readdir(CHECKLIST_DIR)
    ]);

    const researchRows = parseCSV(researchText);
    const sourceRows = parseCSV(sourceText);
    const upstreamProfiles = await buildUpstreamProfiles(
        checklistFiles.filter((file) => file.endsWith(".en.json")).sort()
    );

    const sourceIndex = buildSourceIndex(sourceRows);
    const researchIndex = buildResearchIndex(researchRows);
    const serviceNames = new Set([
        ...Object.keys(REVIEW_META),
        ...Object.keys(researchIndex),
        ...upstreamProfiles.keys()
    ]);

    const items = [...serviceNames]
        .map((serviceName) => buildCatalogItem(serviceName, {
            researchRow: researchIndex[serviceName],
            sourceEntries: sourceIndex[serviceName] || [],
            upstreamProfile: upstreamProfiles.get(serviceName)
        }))
        .filter(Boolean)
        .sort(compareItems);

    const payload = {
        generatedAt: new Date().toISOString(),
        source: {
            upstreamRepo: "Azure/review-checklists",
            upstreamChecklistFileCount: checklistFiles.filter((file) => file.endsWith(".en.json")).length,
            catalogItemCount: items.length
        },
        items
    };

    await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`Generated ${items.length} review catalog items at ${path.relative(ROOT, OUTPUT_PATH)}`);
}

function buildSourceIndex(sourceRows) {
    return sourceRows.reduce((index, row) => {
        const serviceName = canonicalizeServiceName(row["Azure Service"]);

        if (!index[serviceName]) {
            index[serviceName] = [];
        }

        index[serviceName].push(row);
        return index;
    }, {});
}

function buildResearchIndex(researchRows) {
    return researchRows.reduce((index, row) => {
        const serviceName = canonicalizeServiceName(row["Azure Service"]);

        if (!index[serviceName]) {
            index[serviceName] = row;
        }

        return index;
    }, {});
}

async function buildUpstreamProfiles(files) {
    const profiles = new Map();

    for (const file of files) {
        const document = JSON.parse(await fs.readFile(path.join(CHECKLIST_DIR, file), "utf8"));
        const documentName = cleanValue(document.metadata?.name) || titleFromFile(file);
        const documentState = cleanValue(document.metadata?.state);
        const documentTimestamp = cleanValue(document.metadata?.timestamp);

        for (const item of document.items || []) {
            const rawServiceName = cleanValue(item.service);
            const serviceName = canonicalizeServiceName(rawServiceName);

            if (IGNORE_SERVICES.has(serviceName.toLowerCase())) {
                continue;
            }

            const profile = profiles.get(serviceName) || createProfile(serviceName);
            const checklistName = cleanValue(item.checklist) || documentName;
            const severity = normalizeSeverity(item.severity);
            const category = cleanValue(item.category);
            const subcategory = cleanValue(item.subcategory);
            const dimension = cleanValue(item.waf);
            const links = extractHttpUrls(item.link);
            const text = cleanValue(item.text || item.description);
            const armService = cleanValue(item["arm-service"]);

            profile.itemCount += 1;
            profile.rawNames.add(rawServiceName);
            profile.checklistFiles.add(file);
            profile.checklistNames.add(checklistName);
            if (documentState) {
                profile.states.add(documentState);
            }
            if (documentTimestamp) {
                profile.timestamps.add(documentTimestamp);
                profile.lastReviewedDate = latestDate(profile.lastReviewedDate, documentTimestamp);
            }
            increment(profile.severities, severity);
            increment(profile.categories, category);
            increment(profile.subcategories, subcategory);
            increment(profile.dimensions, dimension);
            if (armService) {
                profile.armServices.add(armService);
            }
            if (text && !profile.sampleTexts.includes(text)) {
                profile.sampleTexts.push(text);
            }
            links.forEach((link) => {
                if (link && !profile.references.has(link)) {
                    profile.references.set(link, {
                        label: checklistName,
                        url: link,
                        updated: documentTimestamp || "",
                        severity
                    });
                }
            });

            profiles.set(serviceName, profile);
        }
    }

    return profiles;
}

function createProfile(serviceName) {
    return {
        serviceName,
        rawNames: new Set(),
        checklistFiles: new Set(),
        checklistNames: new Set(),
        states: new Set(),
        timestamps: new Set(),
        categories: new Map(),
        subcategories: new Map(),
        dimensions: new Map(),
        severities: new Map(),
        references: new Map(),
        armServices: new Set(),
        sampleTexts: [],
        itemCount: 0,
        lastReviewedDate: ""
    };
}

function buildCatalogItem(serviceName, { researchRow, sourceEntries, upstreamProfile }) {
    const curatedMeta = REVIEW_META[serviceName];

    if (!curatedMeta && !upstreamProfile && !researchRow) {
        return null;
    }

    const maturity = curatedMeta?.maturity || inferMaturity(upstreamProfile);
    const severity = curatedMeta?.severity || inferSeverity(upstreamProfile);
    const family = curatedMeta?.serviceFamily || inferServiceFamily(serviceName, upstreamProfile);
    const category = curatedMeta?.category || inferCategory(serviceName, family, upstreamProfile);
    const references = mergeReferences(
        buildResearchReferences(researchRow, sourceEntries),
        buildUpstreamReferences(upstreamProfile)
    );
    const lastReviewedDate = cleanValue(researchRow?.["Date Reviewed"])
        || cleanValue(upstreamProfile?.lastReviewedDate)
        || "";
    const summary = curatedMeta?.summary || buildSummary(serviceName, upstreamProfile, family, category);
    const guardrail = curatedMeta?.guardrail || buildGuardrail(serviceName, maturity, upstreamProfile);
    const recommendedActions = curatedMeta?.recommendedActions || buildRecommendedActions(serviceName, upstreamProfile);
    const detail = curatedMeta && researchRow
        ? buildCuratedDetail(researchRow)
        : buildGeneratedDetail(serviceName, upstreamProfile);
    const rules = MATURITY_CONFIG[maturity] || MATURITY_CONFIG.Advisory;

    return {
        id: slugify(serviceName),
        title: curatedMeta?.title || `${serviceName} review posture`,
        summary,
        serviceFamily: family,
        serviceName,
        category,
        severity,
        maturity,
        sourceName: references[0]?.label || "Microsoft guidance",
        sourceUrl: references[0]?.url || "",
        sourceVersion: references[0]?.updated || "Current as reviewed",
        lastReviewedDate,
        tags: curatedMeta?.tags || buildTags(serviceName, family, category, upstreamProfile),
        exportEligible: rules.defaultExport,
        requiresExplicitOverride: rules.overrideRequired,
        notes: summary,
        guardrail,
        recommendedActions,
        references,
        localNote: "",
        detail,
        checklistCoverage: {
            checklistCount: upstreamProfile?.checklistFiles.size || 0,
            itemCount: upstreamProfile?.itemCount || 0,
            checklistNames: upstreamProfile ? [...upstreamProfile.checklistNames].sort() : []
        }
    };
}

function buildCuratedDetail(row) {
    return {
        haSummary: row["HA Capability Summary"],
        drSummary: row["DR Capability Summary"],
        limitations: sentenceList(row["Limitations"], 3),
        dependencies: listFromDelimited(row["Dependencies"]).slice(0, 5),
        recommendedFor: sentenceList(row["Recommended For"], 2),
        notRecommendedFor: sentenceList(row["Not Recommended For"], 2),
        testGuidance: sentenceList(row["Test / Drill Guidance"], 2),
        cost: cleanValue(row["Cost Level"]),
        complexity: cleanValue(row["Complexity Level"]),
        confidence: cleanValue(row["Source Confidence"] || row["Decision Confidence"]),
        documentationReviewDate: cleanValue(row["Date Reviewed"])
    };
}

function buildGeneratedDetail(serviceName, upstreamProfile) {
    const checklistCount = upstreamProfile?.checklistFiles.size || 0;
    const itemCount = upstreamProfile?.itemCount || 0;
    const dimensions = topKeys(upstreamProfile?.dimensions, 3);
    const categories = topKeys(upstreamProfile?.categories, 3);

    return {
        haSummary: checklistCount
            ? `${serviceName} is covered by ${checklistCount} upstream checklist${checklistCount === 1 ? "" : "s"} with ${itemCount} captured review checks.`
            : "",
        drSummary: dimensions.length
            ? `The strongest checklist coverage for ${serviceName} concentrates on ${dimensions.join(", ")}.`
            : "",
        limitations: [
            `This posture is derived from upstream checklist coverage, not a workload-specific sign-off.`,
            checklistCount
                ? `Coverage spans ${checklistCount} checklist${checklistCount === 1 ? "" : "s"} and can mix service-specific and cross-cutting controls.`
                : "Coverage comes from Microsoft checklist content and still needs workload-specific validation.",
            `Validate tier, region, and dependent-service assumptions before treating this item as leadership-ready.`
        ],
        dependencies: buildDependencies(dimensions),
        recommendedFor: [],
        notRecommendedFor: [],
        testGuidance: buildTestGuidance(serviceName, dimensions, categories),
        cost: "",
        complexity: dimensions.includes("Reliability") || dimensions.includes("Security") ? "Medium" : "Low",
        confidence: upstreamProfile?.references.size ? "Medium" : "Low",
        documentationReviewDate: cleanValue(upstreamProfile?.lastReviewedDate)
    };
}

function buildResearchReferences(row, sourceEntries) {
    if (!row && !sourceEntries.length) {
        return [];
    }

    const references = [];
    const docLinks = [
        row?.["Best Microsoft Learn Documentation Link 1"],
        row?.["Best Microsoft Learn Documentation Link 2"],
        row?.["Best Microsoft Learn Documentation Link 3"]
    ].flatMap((url) => extractHttpUrls(url));

    sourceEntries.slice(0, 3).forEach((source) => {
        extractHttpUrls(source["Source URL"]).forEach((url) => {
            references.push({
                label: cleanValue(source["Source Title"]) || "Microsoft source",
                url,
                updated: cleanValue(source["Last Updated (If Available)"]) || cleanValue(source["Date Accessed"])
            });
        });
    });

    docLinks.forEach((url, index) => {
        if (!references.some((reference) => reference.url === url)) {
            references.push({
                label: index === 0 ? "Primary Microsoft guidance" : `Supporting Microsoft guidance ${index + 1}`,
                url,
                updated: cleanValue(row?.["Date Reviewed"])
            });
        }
    });

    return references;
}

function buildUpstreamReferences(upstreamProfile) {
    if (!upstreamProfile) {
        return [];
    }

    return [...upstreamProfile.references.values()]
        .sort((left, right) => compareSeverity(left.severity, right.severity) || left.label.localeCompare(right.label))
        .map((reference) => ({
            label: reference.label,
            url: reference.url,
            updated: reference.updated
        }));
}

function mergeReferences(...groups) {
    const index = new Map();

    groups.flat().forEach((reference) => {
        const url = cleanValue(reference?.url);

        if (!url || index.has(url)) {
            return;
        }

        index.set(url, {
            label: cleanValue(reference.label) || "Microsoft guidance",
            url,
            updated: cleanValue(reference.updated)
        });
    });

    return [...index.values()].slice(0, 4);
}

function inferMaturity(upstreamProfile) {
    if (!upstreamProfile) {
        return "Advisory";
    }

    const normalizedStates = [...upstreamProfile.states]
        .map((value) => cleanValue(value).toLowerCase())
        .filter(Boolean);

    const hasGa = normalizedStates.includes("ga");
    const hasPreview = normalizedStates.includes("preview");
    const hasDeprecated = normalizedStates.includes("deprecated");

    if (hasDeprecated && !hasGa && !hasPreview) {
        return "Deprecated";
    }

    if (hasPreview && hasGa) {
        return "Advisory";
    }

    if (hasPreview) {
        return "Preview";
    }

    if (hasDeprecated) {
        return "Advisory";
    }

    if (hasGa) {
        return "GA-ready";
    }

    return "Advisory";
}

function inferSeverity(upstreamProfile) {
    if (!upstreamProfile) {
        return "Medium";
    }

    return topKeys(upstreamProfile.severities, 1)[0] || "Medium";
}

function inferServiceFamily(serviceName, upstreamProfile) {
    if (FAMILY_OVERRIDES[serviceName]) {
        return FAMILY_OVERRIDES[serviceName];
    }

    const normalized = serviceName.toLowerCase();
    const topCategories = topKeys(upstreamProfile?.categories, 3).join(" ").toLowerCase();
    const topDimensions = topKeys(upstreamProfile?.dimensions, 3).join(" ").toLowerCase();

    if (/(sql|mysql|postgresql|cosmos|redis)/i.test(serviceName)) {
        return "Databases";
    }

    if (/(data|storage|fabric|purview|synapse|databricks)/i.test(serviceName)) {
        return "Storage and Data Services";
    }

    if (/(service bus|event hubs|logic apps|api management|gateway|bot|iot)/i.test(normalized)) {
        return "Integration and Messaging";
    }

    if (/(openai|ai |machine learning|foundry|search|content safety)/i.test(normalized)) {
        return "AI / Platform Services";
    }

    if (/(sap|dynamics)/i.test(normalized)) {
        return "Business Applications";
    }

    if (/(virtual machines|container apps|kubernetes|aks|functions|app service|spring|openshift|vmware|service fabric|hci|container registry|avd)/i.test(normalized)) {
        return "Compute";
    }

    if (/(security|identity|network|management|governance)/i.test(topCategories)
        || /(security|operations|cost|reliability)/i.test(topDimensions)
        || /(front door|load balancer|traffic manager|firewall|bastion|expressroute|dns|entra|ad |key vault|monitor|policy|rbac|resource manager|backup|site recovery|network|vnet|vpn|vwan|waf)/i.test(normalized)) {
        return "Identity, Security, and Platform Dependencies";
    }

    return "Identity, Security, and Platform Dependencies";
}

function inferCategory(serviceName, family, upstreamProfile) {
    if (CATEGORY_OVERRIDES[serviceName]) {
        return CATEGORY_OVERRIDES[serviceName];
    }

    const topCategory = topKeys(upstreamProfile?.categories, 1)[0];

    if (topCategory && !/^(governance|management|best practices|bc and dr|operations management)$/i.test(topCategory)) {
        return topCategory;
    }

    if (family === "Databases") {
        return "Database";
    }

    if (family === "Storage and Data Services") {
        return "Data platform";
    }

    if (family === "Integration and Messaging") {
        return "Integration service";
    }

    if (family === "AI / Platform Services") {
        return "AI platform";
    }

    if (family === "Compute") {
        return "Application platform";
    }

    if (family === "Business Applications") {
        return "Business application";
    }

    return "Platform dependency";
}

function buildSummary(serviceName, upstreamProfile, family, category) {
    const checklistCount = upstreamProfile?.checklistFiles.size || 0;
    const itemCount = upstreamProfile?.itemCount || 0;
    const dimensions = topKeys(upstreamProfile?.dimensions, 3);
    const focus = dimensions.length ? dimensions.join(", ") : `${family.toLowerCase()} guidance`;

    return `${serviceName} is covered through checklist-derived ${category.toLowerCase()} guidance with emphasis on ${focus}. The catalog aggregates ${itemCount} checklist item${itemCount === 1 ? "" : "s"} across ${checklistCount} upstream review checklist${checklistCount === 1 ? "" : "s"} so the service can be explored consistently in one review surface.`;
}

function buildGuardrail(serviceName, maturity, upstreamProfile) {
    const checklistCount = upstreamProfile?.checklistFiles.size || 0;

    if (maturity === "Preview") {
        return `Do not treat ${serviceName} as a default export baseline. The current posture depends on preview checklist coverage and still needs deliberate inclusion.`;
    }

    if (maturity === "Deprecated") {
        return `Do not include ${serviceName} in a default leadership pack. The associated upstream checklist coverage is deprecated.`;
    }

    return `Do not treat checklist coverage alone as workload sign-off for ${serviceName}. Validate deployment scope, tier, region, and dependencies before treating ${serviceName} as decision ready across ${checklistCount || "multiple"} checklist source${checklistCount === 1 ? "" : "s"}.`;
}

function buildRecommendedActions(serviceName, upstreamProfile) {
    const dimensions = topKeys(upstreamProfile?.dimensions, 3);
    const focus = dimensions.length ? dimensions.join(", ").toLowerCase() : "service controls";

    return [
        `Review the highest-severity ${serviceName} checklist items first and capture any local exceptions in your workspace.`,
        `Validate tier, regional support, and dependent-service assumptions against the linked Microsoft documentation.`,
        `Confirm ${focus} expectations with the owning team before exporting this service in a review pack.`
    ];
}

function buildDependencies(dimensions) {
    const dependencies = new Set(["Service tier and regional support"]);

    if (dimensions.includes("Security")) {
        dependencies.add("Identity, key management, and network access controls");
    }

    if (dimensions.includes("Reliability")) {
        dependencies.add("Failover topology, replication, and recovery procedures");
    }

    if (dimensions.includes("Operations")) {
        dependencies.add("Monitoring, alerting, and operational runbooks");
    }

    if (dimensions.includes("Performance")) {
        dependencies.add("Capacity planning and performance baselines");
    }

    if (dimensions.includes("Cost")) {
        dependencies.add("Cost guardrails and scaling assumptions");
    }

    return [...dependencies].slice(0, 5);
}

function buildTestGuidance(serviceName, dimensions, categories) {
    const tests = [
        `Start with the highest-severity ${serviceName} checklist items and confirm the linked Microsoft guidance still matches your deployment scope.`,
        `Capture local assumptions and exceptions before exporting ${serviceName} as part of a review pack.`
    ];

    if (dimensions.includes("Reliability")) {
        tests.push(`Run or review failover and recovery drills for the workload path that depends on ${serviceName}.`);
    } else if (dimensions.includes("Security")) {
        tests.push(`Validate representative security controls for ${serviceName} in a non-production environment before export.`);
    } else if (categories.length) {
        tests.push(`Review the leading checklist categories for ${serviceName}: ${categories.join(", ")}.`);
    }

    return tests.slice(0, 3);
}

function buildTags(serviceName, family, category, upstreamProfile) {
    return uniqueStrings([
        serviceName,
        family,
        category,
        ...topKeys(upstreamProfile?.dimensions, 4),
        ...topKeys(upstreamProfile?.categories, 4)
    ]).map((value) => value.toLowerCase());
}

function compareItems(left, right) {
    const maturityOrder = ["GA-ready", "Advisory", "Preview", "Deprecated"];
    const maturityDelta = maturityOrder.indexOf(left.maturity) - maturityOrder.indexOf(right.maturity);

    if (maturityDelta !== 0) {
        return maturityDelta;
    }

    const severityDelta = compareSeverity(left.severity, right.severity);

    if (severityDelta !== 0) {
        return severityDelta;
    }

    return left.serviceName.localeCompare(right.serviceName);
}

function compareSeverity(left, right) {
    return SEVERITY_ORDER.indexOf(left) - SEVERITY_ORDER.indexOf(right);
}

function normalizeSeverity(value) {
    const cleaned = cleanValue(value);
    return SEVERITY_ORDER.includes(cleaned) ? cleaned : "Medium";
}

function increment(map, value) {
    const cleaned = cleanValue(value);

    if (!cleaned) {
        return;
    }

    map.set(cleaned, (map.get(cleaned) || 0) + 1);
}

function topKeys(map, limit = 3) {
    if (!map) {
        return [];
    }

    return [...map.entries()]
        .sort((left, right) => right[1] - left[1] || compareSeverity(left[0], right[0]) || left[0].localeCompare(right[0]))
        .map(([value]) => value)
        .slice(0, limit);
}

function latestDate(currentValue, nextValue) {
    const currentDate = parseDate(currentValue);
    const nextDate = parseDate(nextValue);

    if (!currentDate && !nextDate) {
        return cleanValue(currentValue) || cleanValue(nextValue);
    }

    if (!currentDate) {
        return cleanValue(nextValue);
    }

    if (!nextDate) {
        return cleanValue(currentValue);
    }

    return nextDate > currentDate ? cleanValue(nextValue) : cleanValue(currentValue);
}

function parseDate(value) {
    const cleaned = cleanValue(value);

    if (!cleaned) {
        return null;
    }

    const parsed = new Date(cleaned);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function titleFromFile(file) {
    return cleanValue(
        file
            .replace(/_checklist\.en\.json$/i, "")
            .replace(/_/g, " ")
    );
}

function uniqueStrings(values) {
    return [...new Set(values.map((value) => cleanValue(value)).filter(Boolean))];
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
