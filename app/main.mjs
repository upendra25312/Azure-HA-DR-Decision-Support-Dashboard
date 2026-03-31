console.log('[SPA TRACE] main.mjs loaded');
// Global unhandled promise rejection handler for debugging async errors
window.addEventListener("unhandledrejection", function(event) {
    const errorDiv = document.createElement("div");
    errorDiv.style.background = "#ffdddd";
    errorDiv.style.color = "#a00";
    errorDiv.style.padding = "16px";
    errorDiv.style.fontSize = "16px";
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "48px";
    errorDiv.style.left = "0";
    errorDiv.style.right = "0";
    errorDiv.style.zIndex = "9999";
    errorDiv.innerText = "Unhandled promise rejection: " + (event.reason && event.reason.message ? event.reason.message : event.reason);
    document.body.prepend(errorDiv);
});
import { buildCsvExport, buildJsonExport, buildMarkdownExport, downloadTextFile } from "./exporter.mjs";
import { renderExplorerRoute } from "./components/explorer/renderExplorerRoute.mjs";
import { renderHomeRoute } from "./components/home/renderHomeRoute.mjs";
import { renderMethodRoute } from "./components/method/renderMethodRoute.mjs";
import { renderArchitecturePathsRoute } from "./components/paths/renderArchitecturePathsRoute.mjs";
import { renderFooter } from "./components/shell/renderFooter.mjs";
import { renderTopbar } from "./components/shell/renderTopbar.mjs";
import { renderWorkspaceRoute } from "./components/workspace/renderWorkspaceRoute.mjs";
import { ARCHITECTURE_PATHS } from "./data/paths.mjs";
import {
    FAMILY_BLURBS,
    MATURITY_CONFIG,
    REVIEW_META,
    SEVERITY_CONFIG
} from "./data/reviewMeta.mjs";
import {
    FOOTER_COPY,
    HOME_PAGE_COPY,
    METHOD_PAGE_COPY,
    PRODUCT,
    SITE_NAV,
    WORKSPACE_COPY
} from "./data/siteContent.mjs";
import {
    canonicalizeServiceName,
    cleanValue,
    escapeHtml,
    extractHttpUrls,
    formatDate,
    isHiddenPublicSourceUrl,
    listFromDelimited,
    parseCSV,
    sentenceList,
    slugify,
    summarizeCount,
    uniqueValues
} from "./utils.mjs";

const NOTES_KEY = "azure-review-board:local-notes";
const WORKSPACE_KEY = "azure-review-board:personal-workspace";
const DEFAULT_WORKSPACE_NAME = "My review pack";
const ROUTES = [
    { path: "/", title: "Home", mode: "public" },
    { path: "/explorer", title: "Explorer", mode: "public" },
    { path: "/paths", title: "Architecture Paths", mode: "public" },
    { path: "/method", title: "Review Method", mode: "public" },
    { path: "/workspace", title: "Workspace", mode: "public" }
];
const LEGACY_ROUTE_REDIRECTS = {
    "/services": "/explorer",
    "/reference-architectures": "/paths?type=reference",
    "/security-compliance": "/paths?type=security",
    "/patterns": "/paths?type=pattern",
    "/roadmap": "/method",
    "/admin": "/method",
    "/reports": "/workspace"
};

const EXPORT_DEFAULTS = {
    includeAdvisory: false,
    includePreview: false,
    includeNotes: true
};

const state = {
    items: [],
    sources: [],
    families: [],
    services: [],
    categories: [],
    loading: true,
    error: "",
    exportPanelOpen: false,
    exportOptions: { ...EXPORT_DEFAULTS },
    notes: loadNotes(),
    workspace: loadWorkspace()
};


const app = document.getElementById("app");

// Global error handler for debugging client-side errors
window.addEventListener("error", function(event) {
    const errorDiv = document.createElement("div");
    errorDiv.style.background = "#ffdddd";
    errorDiv.style.color = "#a00";
    errorDiv.style.padding = "16px";
    errorDiv.style.fontSize = "16px";
    errorDiv.style.position = "fixed";
    errorDiv.style.top = "0";
    errorDiv.style.left = "0";
    errorDiv.style.right = "0";
    errorDiv.style.zIndex = "9999";
    errorDiv.innerText = "Uncaught error: " + event.message + "\n(" + event.filename + ":" + event.lineno + ")";
    document.body.prepend(errorDiv);
});

document.addEventListener("click", handleDocumentClick);
document.addEventListener("input", handleDocumentInput);
document.addEventListener("change", handleDocumentChange);
window.addEventListener("popstate", render);

bootstrap();

async function bootstrap() {
    console.log('[SPA TRACE] bootstrap() started');
    render();

    const dataResult = await loadCatalogData();

    if (dataResult.error) {
        state.loading = false;
        state.error = dataResult.error;
        render();
        return;
    }

    state.items = dataResult.items;
    state.sources = dataResult.sourceRows;
    state.families = uniqueValues(state.items, "serviceFamily");
    state.services = uniqueValues(state.items, "serviceName");
    state.categories = uniqueValues(state.items, "category");
    syncNotesIntoItems();
    state.loading = false;
    render();
}



async function loadCatalogData() {
    try {
        const generatedResponse = await fetch("/data/generated/review-catalog.json", {
            cache: "no-store"
        });

        if (generatedResponse.ok) {
            const payload = await generatedResponse.json();
            const items = Array.isArray(payload.items)
                ? payload.items.map((item) => normalizeCatalogItem(item))
                : [];

            return {
                items,
                sourceRows: Array.isArray(payload.sources) ? payload.sources : []
            };
        }

        const [researchResponse, sourceResponse] = await Promise.all([
            fetch("/data/research_knowledge_base.csv"),
            fetch("/data/source_register.csv")
        ]);

        if (!researchResponse.ok || !sourceResponse.ok) {
            throw new Error("The review catalog could not be loaded.");
        }

        const researchRows = parseCSV(await researchResponse.text());
        const sourceRows = parseCSV(await sourceResponse.text());
        const items = buildReviewItems(researchRows, sourceRows);

        return { items, sourceRows };
    } catch (error) {
        return { error: "The review catalog could not be loaded. Verify that the CSV files are available in this deployment." };
    }
}

function normalizeCatalogItem(item) {
    const serviceName = canonicalizeServiceName(item.serviceName || item.title || "Unnamed service");
    const maturity = MATURITY_CONFIG[item.maturity] ? item.maturity : "Advisory";
    const severity = SEVERITY_CONFIG[item.severity] ? item.severity : "Medium";
    const rules = MATURITY_CONFIG[maturity];
    const references = Array.isArray(item.references)
        ? item.references
            .flatMap((reference) => extractHttpUrls(reference?.url).map((url) => ({
                label: cleanValue(reference?.label) || "Microsoft guidance",
                url,
                updated: cleanValue(reference?.updated)
            })))
            .filter((reference) => reference.url && !isHiddenPublicSourceUrl(reference.url))
        : [];
    const sourceUrls = extractHttpUrls(item.sourceUrl);

    return {
        id: cleanValue(item.id) || slugify(serviceName),
        title: cleanValue(item.title) || `${serviceName} review posture`,
        summary: cleanValue(item.summary) || "Checklist-derived review guidance for this Azure service.",
        serviceFamily: cleanValue(item.serviceFamily) || "Identity, Security, and Platform Dependencies",
        serviceName,
        category: cleanValue(item.category) || "Platform dependency",
        severity,
        maturity,
        sourceName: cleanValue(item.sourceName) || references[0]?.label || "Microsoft guidance",
        sourceUrl: sourceUrls[0] || references[0]?.url || "",
        sourceVersion: cleanValue(item.sourceVersion) || references[0]?.updated || "Current as reviewed",
        lastReviewedDate: cleanValue(item.lastReviewedDate),
        tags: Array.isArray(item.tags) ? item.tags.map((tag) => cleanValue(tag)).filter(Boolean) : [],
        exportEligible: typeof item.exportEligible === "boolean" ? item.exportEligible : rules.defaultExport,
        requiresExplicitOverride: typeof item.requiresExplicitOverride === "boolean"
            ? item.requiresExplicitOverride
            : rules.overrideRequired,
        notes: cleanValue(item.notes) || cleanValue(item.summary),
        guardrail: cleanValue(item.guardrail) || rules.warning,
        recommendedActions: Array.isArray(item.recommendedActions)
            ? item.recommendedActions.map((action) => cleanValue(action)).filter(Boolean)
            : ["Validate the linked Microsoft guidance before exporting this service."],
        references,
        localNote: "",
        detail: {
            haSummary: cleanValue(item.detail?.haSummary),
            drSummary: cleanValue(item.detail?.drSummary),
            limitations: Array.isArray(item.detail?.limitations)
                ? item.detail.limitations.map((entry) => cleanValue(entry)).filter(Boolean)
                : [],
            dependencies: Array.isArray(item.detail?.dependencies)
                ? item.detail.dependencies.map((entry) => cleanValue(entry)).filter(Boolean)
                : [],
            recommendedFor: Array.isArray(item.detail?.recommendedFor)
                ? item.detail.recommendedFor.map((entry) => cleanValue(entry)).filter(Boolean)
                : [],
            notRecommendedFor: Array.isArray(item.detail?.notRecommendedFor)
                ? item.detail.notRecommendedFor.map((entry) => cleanValue(entry)).filter(Boolean)
                : [],
            testGuidance: Array.isArray(item.detail?.testGuidance)
                ? item.detail.testGuidance.map((entry) => cleanValue(entry)).filter(Boolean)
                : [],
            cost: cleanValue(item.detail?.cost),
            complexity: cleanValue(item.detail?.complexity),
            confidence: cleanValue(item.detail?.confidence),
            documentationReviewDate: cleanValue(item.detail?.documentationReviewDate)
        },
        checklistCoverage: item.checklistCoverage || null
    };
}

function buildReviewItems(researchRows, sourceRows) {
    const sourceIndex = sourceRows.reduce((index, row) => {
        const service = canonicalizeServiceName(row["Azure Service"]);

        if (!index[service]) {
            index[service] = [];
        }

        index[service].push(row);
        return index;
    }, {});

    return researchRows
        .map((row) => {
            const serviceName = canonicalizeServiceName(row["Azure Service"]);
            const meta = REVIEW_META[serviceName];

            if (!meta) {
                return null;
            }

            const references = buildReferences(row, sourceIndex[serviceName] || []);
            const maturityRules = MATURITY_CONFIG[meta.maturity];

            return {
                id: slugify(serviceName),
                title: meta.title,
                summary: meta.summary,
                serviceFamily: meta.serviceFamily,
                serviceName,
                category: meta.category,
                severity: meta.severity,
                maturity: meta.maturity,
                sourceName: references[0]?.label || "Microsoft Learn",
                sourceUrl: references[0]?.url || "",
                sourceVersion: references[0]?.updated || "Current as reviewed",
                lastReviewedDate: row["Date Reviewed"],
                tags: meta.tags,
                exportEligible: maturityRules.defaultExport,
                requiresExplicitOverride: maturityRules.overrideRequired,
                notes: meta.summary,
                guardrail: meta.guardrail,
                recommendedActions: meta.recommendedActions,
                references,
                localNote: state.notes[slugify(serviceName)] || "",
                detail: {
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
                }
            };
        })
        .filter(Boolean)
        .sort((left, right) => {
            const maturityOrder = ["GA-ready", "Advisory", "Preview", "Deprecated"];
            const severityOrder = ["High", "Medium", "Low"];

            const maturityDelta = maturityOrder.indexOf(left.maturity) - maturityOrder.indexOf(right.maturity);
            if (maturityDelta !== 0) {
                return maturityDelta;
            }

            const severityDelta = severityOrder.indexOf(left.severity) - severityOrder.indexOf(right.severity);
            if (severityDelta !== 0) {
                return severityDelta;
            }

            return left.serviceName.localeCompare(right.serviceName);
        });
}

function buildReferences(row, sourceEntries) {
    const candidates = [];
    const docLinks = [
        row["Best Microsoft Learn Documentation Link 1"],
        row["Best Microsoft Learn Documentation Link 2"],
        row["Best Microsoft Learn Documentation Link 3"]
    ].flatMap((url) => extractHttpUrls(url));

    sourceEntries.slice(0, 3).forEach((source) => {
        extractHttpUrls(source["Source URL"]).forEach((url) => {
            candidates.push({
                label: cleanValue(source["Source Title"]) || "Microsoft source",
                url,
                updated: cleanValue(source["Last Updated (If Available)"]) || cleanValue(source["Date Accessed"])
            });
        });
    });

    docLinks.forEach((url, index) => {
        if (!candidates.some((candidate) => candidate.url === url)) {
            candidates.push({
                label: index === 0 ? "Primary Microsoft guidance" : `Supporting Microsoft guidance ${index + 1}`,
                url,
                updated: cleanValue(row["Date Reviewed"])
            });
        }
    });

    return candidates
        .filter((candidate) => !isHiddenPublicSourceUrl(candidate.url))
        .slice(0, 4);
}

function render() {
    const route = currentRoute();

    if (route.redirectTo) {
        window.history.replaceState({}, "", route.redirectTo);
        render();
        return;
    }

    document.title = route.title ? `${route.title} | ${PRODUCT.name}` : PRODUCT.name;

    app.innerHTML = `
        <div class="shell">
            ${renderTopbar({
                brandEyebrow: PRODUCT.brandEyebrow,
                brandName: PRODUCT.name,
                navItems: SITE_NAV,
                activePath: route.path
            })}
            ${renderPage(route)}
            ${renderFooter(FOOTER_COPY)}
        </div>
    `;
}

function renderPage(route) {
    if (state.loading) {
        return `
            <main id="main" class="page">
                <section class="loading-state">
                    <div>
                        <h1 class="hero-title">Loading the public review catalog.</h1>
                        <p class="hero-copy">Applying source-backed review data, maturity rules, and local workspace state.</p>
                    </div>
                </section>
            </main>
        `;
    }

    if (state.error) {
        return `
            <main id="main" class="page">
                <section class="error-state">
                    <div>
                        <h1 class="hero-title">The review data could not be loaded.</h1>
                        <p class="hero-copy">${escapeHtml(state.error)}</p>
                        <button class="button" data-action="reload">Retry</button>
                    </div>
                </section>
            </main>
        `;
    }

    switch (route.path) {
        case "/":
            return renderHomeRoute({
                copy: HOME_PAGE_COPY,
                paths: ARCHITECTURE_PATHS,
                metrics: calculateMetrics(state.items)
            });
        case "/explorer":
            return renderExplorerPage();
        case "/paths":
            return renderPathsPage();
        case "/method":
            return renderMethodRoute({ copy: METHOD_PAGE_COPY });
        case "/workspace":
            return renderWorkspacePage();
        default:
            return renderNotFoundPage();
    }
}

function renderPatternsPage() {
    return `
        <main class="page">
            <h1>HA/DR Patterns</h1>
            <p>Browse authoritative Azure High Availability (HA) and Disaster Recovery (DR) patterns, with direct links to Microsoft Learn and official diagrams.</p>
            <ul>
                <li><a href="https://learn.microsoft.com/azure/architecture/web-apps/guides/multi-region-app-service/multi-region-app-service" target="_blank">Multi-region App Service DR</a> – Official App Service DR pattern for RTO/RPO-driven decisions.</li>
                <li><a href="https://learn.microsoft.com/azure/storage/common/storage-redundancy" target="_blank">Azure Storage redundancy patterns</a> – LRS, GRS, and redundancy models.</li>
                <li><a href="https://learn.microsoft.com/azure/architecture/guide/networking/global-web-applications/overview" target="_blank">Global routing redundancy (Front Door)</a> – Ingress DR and global routing.</li>
                <li><a href="https://learn.microsoft.com/azure/api-management/high-availability" target="_blank">Multi-region API Management deployment</a> – APIM tier-aware HA/DR.</li>
                <li><a href="https://learn.microsoft.com/azure/vpn-gateway/vpn-gateway-highlyavailable" target="_blank">Highly available gateway connectivity</a> – VPN active-active and multi-device resilience.</li>
                <li><a href="https://learn.microsoft.com/azure/cloud-adoption-framework/ready/azure-best-practices/virtual-wan-network-topology" target="_blank">Virtual WAN landing zone topology</a> – Multi-region Virtual WAN topology.</li>
                <li><a href="https://learn.microsoft.com/en-us/fabric/security/experience-specific-guidance" target="_blank">Microsoft Fabric DR guidance</a> – Experience-specific DR actions.</li>
                <li><a href="https://learn.microsoft.com/en-us/power-platform/admin/business-continuity-disaster-recovery" target="_blank">Dynamics 365 SaaS BCDR</a> – Official Dynamics continuity reference.</li>
                <li><a href="https://learn.microsoft.com/azure/architecture/ai-ml/architecture/baseline-openai-e2e-chat?source=recommendations" target="_blank">AI workload regional resiliency gap</a> – Baseline Azure AI Foundry chat reference.</li>
                <li><a href="https://learn.microsoft.com/azure/reliability/reliability-aks" target="_blank">AKS HA and DR overview</a> – Zonal and regional design.</li>
                <li><a href="https://learn.microsoft.com/en-gb/azure/reliability/reliability-functions" target="_blank">Multi-region Functions patterns</a> – Trigger-specific active-active/passive patterns.</li>
                <li><a href="https://learn.microsoft.com/azure/reliability/reliability-key-vault" target="_blank">Key Vault paired-region failover</a> – Reliability and failover guidance.</li>
                <li><a href="https://learn.microsoft.com/azure/ai-services/openai/how-to/business-continuity-disaster-recovery" target="_blank">Azure OpenAI BCDR topology</a> – Dual-region resource and gateway design.</li>
            </ul>
            <p>See the <a href="/docs/research-report.md">research report</a> for cross-service findings and decision matrix.</p>
	</main>
    `;
}

function renderReferenceArchitecturesPage() {
    return `
        <main class="page">
            <h1>Reference Architectures</h1>
            <p>Explore official Azure reference architectures for High Availability (HA) and Disaster Recovery (DR):</p>
            <ul>
                <li><a href="https://learn.microsoft.com/en-us/azure/architecture/example-scenario/infrastructure/iaas-high-availability-disaster-recovery" target="_blank">Azure Virtual Machines baseline architecture</a></li>
                <li><a href="https://learn.microsoft.com/azure/architecture/resiliency/" target="_blank">Azure Resiliency guidance</a></li>
                <li><a href="https://learn.microsoft.com/azure/architecture/framework/resiliency/overview" target="_blank">Well-Architected Framework: Resiliency</a></li>
                <li><a href="https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/redundancy" target="_blank">Design for redundancy</a></li>
                <li><a href="https://learn.microsoft.com/en-us/azure/reliability/disaster-recovery-overview" target="_blank">Disaster recovery overview</a></li>
            </ul>
        </main>
    `;
}

function renderSecurityCompliancePage() {
    return `
        <main class="page">
            <h1>Security & Compliance</h1>
            <p>All guidance aligns with Azure security and compliance best practices. Key resources:</p>
            <ul>
                <li><a href="https://learn.microsoft.com/azure/security/fundamentals/overview" target="_blank">Azure Security Fundamentals</a></li>
                <li><a href="https://learn.microsoft.com/azure/defender-for-cloud/" target="_blank">Microsoft Defender for Cloud</a></li>
                <li><a href="https://learn.microsoft.com/azure/compliance/" target="_blank">Azure Compliance Documentation</a></li>
                <li><a href="https://learn.microsoft.com/azure/security/benchmarks/" target="_blank">Azure Security Benchmark</a></li>
                <li><a href="https://learn.microsoft.com/azure/security/" target="_blank">Azure Security Documentation</a></li>
            </ul>
        </main>
    `;
}

function renderTopbarLegacy(route) {
    const navLinks = ROUTES.map((entry) => [
        "<button",
        `class="nav-link ${route.path === entry.path ? "is-active" : ""}"`,
        `data-route="${entry.path}"`,
        ">",
        escapeHtml(entry.title),
        "</button>"
    ].join(" ")).join("");

    return `
        <header class="topbar">
            <div class="brand">
                <div class="brand-mark" aria-hidden="true">AR</div>
                <div>
                    <span class="brand-kicker">Architecture Review</span>
                    <span class="brand-name">${escapeHtml(PRODUCT.name)}</span>
                </div>
            </div>
            <nav class="topbar-nav" aria-label="Primary">
                ${navLinks}
            </nav>
        </header>
    `;
}

function renderHomePage() {
    const metrics = calculateMetrics(state.items);
    const familyCards = topFamilyCards(state.items);

    return `
        <main id="main" class="page">
            <section class="section business-value">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">Why Resilience Matters</p>
                        <h2 class="section-title">Business Value of HA & DR</h2>
                        <p class="section-copy">Downtime and data loss can cost organizations millions. Azure's resilient architectures help you achieve:</p>
                        <ul class="metrics-list">
                            <li><strong>99.99%+ Uptime</strong> for mission-critical workloads (SLA-backed)</li>
                            <li><strong>60% reduction</strong> in unplanned outage costs (Forrester TEI, 2023)</li>
                            <li><strong>Faster recovery</strong> with RTO/RPO targets as low as minutes</li>
                            <li><strong>Global scale</strong> with multi-region failover and geo-redundancy</li>
                        </ul>
                        <p class="section-copy"><a href="https://learn.microsoft.com/en-us/azure/reliability/concept-business-continuity-high-availability-disaster-recovery" target="_blank">See Microsoft guidance on business continuity, HA, and DR</a></p>
                    </div>
                </div>
            </section>
            <section class="page-hero">
                <p class="eyebrow">Decision Support</p>
                <div class="hero-grid">
                    <div class="kpi-stack">
                        <h1 class="hero-title">${escapeHtml(PRODUCT.heroTitle)}</h1>
                        <p class="hero-copy">${escapeHtml(PRODUCT.heroIntro)}</p>
                        <div class="hero-actions">
                            <button class="button" data-route="${PRODUCT.primaryCta.route}">${escapeHtml(PRODUCT.primaryCta.label)}</button>
                            <button class="button-secondary" data-route="${PRODUCT.secondaryCta.route}">${escapeHtml(PRODUCT.secondaryCta.label)}</button>
                        </div>
                        <p class="meta-copy">${escapeHtml(PRODUCT.heroSupport)}</p>
                    </div>
                    <div class="card-grid">
                        ${MODE_CARDS.map((card) => `
                            <article class="mode-card">
                                <p class="eyebrow">${escapeHtml(card.label)}</p>
                                <h2 class="section-title">${escapeHtml(card.title)}</h2>
                                <p class="section-copy">${escapeHtml(card.body)}</p>
                                <button class="button-quiet" data-route="${card.actionRoute}">${escapeHtml(card.actionLabel)}</button>
                            </article>
                        `).join("")}
                    </div>
                </div>
            </section>

            <section class="section">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">Value statement</p>
                        <h2 class="section-title">${escapeHtml(PRODUCT.valueProposition)}</h2>
                    </div>
                </div>
                <div class="metrics-grid">
                    ${renderMetricCard("Source-backed services", metrics.totalItems, "Review items with named documentation references and review dates.")}
                    ${renderMetricCard("GA-ready baseline", metrics.gaReady, "Included by default when a sample export is generated.")}
                    ${renderMetricCard("Advisory items", metrics.advisory, "Visible for review, but excluded from default export without override.")}
                    ${renderMetricCard("Preview watchlist", metrics.preview, "Visible for discovery only and never part of the default baseline.")}
                </div>
            </section>

            <section class="section">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">Trust and value</p>
                        <h2 class="section-title">A public product with one clear job.</h2>
                        <p class="section-copy">The homepage leads to exploration first. Personal workspace stays local and never gets presented as shared workflow.</p>
                    </div>
                </div>
                <div class="card-grid">
                    ${HOME_TRUST_CARDS.map((card) => `
                        <article class="trust-card">
                            <h3>${escapeHtml(card.title)}</h3>
                            <p class="section-copy">${escapeHtml(card.body)}</p>
                        </article>
                    `).join("")}
                </div>
            </section>

            <section class="section">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">Families and services</p>
                        <h2 class="section-title">Browse the service family that carries the architecture risk.</h2>
                    </div>
                    <button class="button-quiet" data-route="/services">View all services</button>
                </div>
                <div class="service-grid">
                    ${familyCards.map((card) => `
                        <article class="service-card">
                            <div class="pill-row">
                                <span class="chip public">${escapeHtml(card.family)}</span>
                                <span class="chip ${card.highSeverityCount ? "high" : "low"}">${card.highSeverityCount} high priority</span>
                            </div>
                            <h3 class="service-title">${escapeHtml(card.family)}</h3>
                            <p class="section-copy">${escapeHtml(card.blurb)}</p>
                            <p class="meta-copy">${summarizeCount(card.itemCount, "service")} · ${card.gaReadyCount} GA-ready · ${card.previewCount} preview</p>
                        </article>
                    `).join("")}
                </div>
            </section>

            <section class="section">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">Governance summary</p>
                        <h2 class="section-title">Maturity changes behavior, not just labels.</h2>
                    </div>
                </div>
                <div class="checklist-grid">
                    ${renderSimpleCard("Default export", "GA-ready items only. Advisory and preview stay out unless included deliberately.")}
                    ${renderSimpleCard("Personal workspace", "Selections, notes, and exports stay in the current browser unless you export them.")}
                    ${renderSimpleCard("Export options", "Build a readable Markdown pack, a CSV analysis file, or a JSON backup for later import.")}
                </div>
            </section>

            <section class="section">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">Method and traceability</p>
                        <h2 class="section-title">Short method. Clear boundaries. No product-state confusion in the main flow.</h2>
                    </div>
                    <button class="button-quiet" data-route="/method">Read the method</button>
                </div>
                <div class="method-grid">
                    ${METHOD_SECTIONS.map((section) => `
                        <article class="method-card">
                            <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
                            <h3>${escapeHtml(section.title)}</h3>
                            <p class="section-copy">${escapeHtml(section.body)}</p>
                        </article>
                    `).join("")}
                </div>
            </section>

            <section class="section">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">Product boundary</p>
                        <h2 class="section-title">What works now and what stays local.</h2>
                    </div>
                </div>
                <div class="checklist-grid">
                    ${renderChecklistCard("What works now", WHAT_WORKS_NOW)}
                    ${renderChecklistCard("What stays local", WHAT_STAYS_LOCAL)}
                    ${renderChecklistCard("What is not supported", NOT_SUPPORTED)}
                </div>
            </section>
        </main>
    `;
}

function renderExplorerPage() {
    const filters = currentExplorerFilters();
    const filteredItems = filterItems(state.items, filters);
    const selectedItem = selectedExplorerItem(filteredItems, filters.item);
    const summary = {
        total: filteredItems.length,
        highSeverity: filteredItems.filter((item) => item.severity === "High").length,
        previewCount: filteredItems.filter((item) => item.maturity === "Preview").length,
        defaultExportEligible: filterExportableItems(filteredItems, state.exportOptions).length
    };
    const presets = ARCHITECTURE_PATHS.map((path) => ({
        label: path.presetLabel,
        route: buildExplorerRoute(path.explorerFilters)
    }));

    return renderExplorerRoute({
        header: {
            eyebrow: "Review Catalog",
            title: "Explore the catalog by service, maturity, and risk.",
            body: "Review source-backed guidance, compare maturity, and add items to your workspace."
        },
        presets,
        summary,
        exportPanelOpen: state.exportPanelOpen,
        exportOptions: state.exportOptions,
        exportWarning: exportWarningText(state.exportOptions),
        filters,
        items: filteredItems,
        selectedItem,
        families: state.families,
        services: state.services,
        categories: state.categories,
        maturityConfig: MATURITY_CONFIG,
        severityConfig: SEVERITY_CONFIG,
        inWorkspace: isInWorkspace
    });
}

function renderPathsPage() {
    const pathState = currentPathSelection();
    const pathOptions = filteredArchitecturePaths(pathState.type);
    const selectedPath = selectArchitecturePath(pathOptions, pathState.path);

    return renderArchitecturePathsRoute({
        paths: pathOptions,
        selectedPath
    });
}

function renderMethodPage() {
    return `
        <main id="main" class="page">
            <section class="page-hero">
                <p class="eyebrow">Method and about</p>
                <h1 class="hero-title">Precise copy, clear boundaries, and no fake enterprise claims.</h1>
                <p class="hero-copy">The method page says what works now, what stays local in the browser, and what the product does not do.</p>
            </section>
            <section class="method-grid">
                ${METHOD_SECTIONS.map((section) => `
                    <article class="method-card">
                        <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
                        <h2 class="section-title">${escapeHtml(section.title)}</h2>
                        <p class="section-copy">${escapeHtml(section.body)}</p>
                    </article>
                `).join("")}
                ${renderChecklistCard("What works now", WHAT_WORKS_NOW)}
                ${renderChecklistCard("What stays local", WHAT_STAYS_LOCAL)}
                ${renderChecklistCard("What is not supported", NOT_SUPPORTED)}
            </section>
        </main>
    `;
}

function renderWorkspacePage() {
    const items = selectedWorkspaceItems();
    const summary = workspaceSummary(items);

    return renderWorkspaceRoute({
        copy: WORKSPACE_COPY,
        workspace: state.workspace,
        items,
        summary,
        exportOptions: state.exportOptions
    });
}

function renderNotFoundPage() {
    return `
        <main id="main" class="page">
            <section class="error-state">
                <div>
                    <h1 class="hero-title">That route does not exist.</h1>
                    <p class="hero-copy">Use Explorer to inspect services or Personal Workspace to build your exported review pack.</p>
                    <button class="button" data-route="/">Return home</button>
                </div>
            </section>
        </main>
    `;
}

function renderFooterLegacy() {
    return `
        <footer class="footer">
            <p class="footer-note">
                Review Surface: open exploration, source traceability, and local-only notes.
                Personal Workspace: local selection, local notes, and export-ready review packs in this browser.
            </p>
            <div class="footer-links">
                <button class="button-quiet" data-route="/explorer">Explorer</button>
                <button class="button-quiet" data-route="/workspace">Personal Workspace</button>
                <button class="button-quiet" data-route="/method">Method</button>
            </div>
        </footer>
    `;
}

function renderMetricCard(label, value, note) {
    return `
        <article class="stat-card">
            <span class="stat-label">${escapeHtml(label)}</span>
            <span class="stat-value">${escapeHtml(String(value))}</span>
            <p class="stat-note">${escapeHtml(note)}</p>
        </article>
    `;
}

function renderSimpleCard(title, body) {
    return `
        <article class="governed-card">
            <h3>${escapeHtml(title)}</h3>
            <p class="section-copy">${escapeHtml(body)}</p>
        </article>
    `;
}

function renderChecklistCard(title, items) {
    return `
        <article class="governed-card">
            <h3>${escapeHtml(title)}</h3>
            <ul class="copy-list">
                ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
        </article>
    `;
}

function renderWorkspaceItem(item) {
    return `
        <article class="workspace-item-card">
            <div>
                <div class="pill-row">
                    <span class="chip ${MATURITY_CONFIG[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                    <span class="chip ${SEVERITY_CONFIG[item.severity].tone}">${escapeHtml(item.severity)}</span>
                    <span class="chip public">${escapeHtml(item.serviceFamily)}</span>
                </div>
                <h3>${escapeHtml(item.serviceName)}</h3>
                <p class="section-copy">${escapeHtml(item.summary)}</p>
            </div>
            <div class="hero-actions">
                <button class="button-quiet" data-route="/explorer?service=${encodeURIComponent(item.serviceName)}&item=${encodeURIComponent(item.id)}">Open in explorer</button>
                <button class="button-secondary" data-action="remove-from-workspace" data-item-id="${escapeHtml(item.id)}">Remove</button>
            </div>
        </article>
    `;
}

function renderWorkspaceNoteCard(item) {
    return `
        <article class="workspace-note-card">
            <div class="pill-row">
                <span class="chip ${MATURITY_CONFIG[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                <span class="chip ${SEVERITY_CONFIG[item.severity].tone}">${escapeHtml(item.severity)}</span>
            </div>
            <h3>${escapeHtml(item.serviceName)}</h3>
            <textarea
                class="textarea"
                data-note-id="${escapeHtml(item.id)}"
                placeholder="Capture the service-specific note for this review pack."
            >${escapeHtml(state.notes[item.id] || item.localNote || "")}</textarea>
        </article>
    `;
}

function renderSelectOptions(placeholder, values, selected) {
    const options = [`<option value="">${escapeHtml(placeholder)}</option>`];

    values.forEach((value) => {
        options.push(`<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`);
    });

    return options.join("");
}

function renderCheckboxGroup(name, values, selectedValues) {
    return values.map((value) => `
        <label class="filter-chip-row">
            <input
                type="checkbox"
                name="${escapeHtml(name)}"
                value="${escapeHtml(value)}"
                ${selectedValues.includes(value) ? "checked" : ""}
            >
            <span class="chip ${name === "maturity" ? MATURITY_CONFIG[value].tone : SEVERITY_CONFIG[value].tone}">
                ${escapeHtml(value)}
            </span>
        </label>
    `).join("");
}

function renderReviewCard(item, selected) {
    const isPreview = item.maturity === "Preview";

    return `
        <article
            class="review-card ${selected ? "is-selected" : ""} ${isPreview ? "preview-item" : ""}"
            tabindex="0"
            data-action="select-item"
            data-item-id="${escapeHtml(item.id)}"
        >
            <div class="pill-row">
                <span class="chip ${MATURITY_CONFIG[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                <span class="chip ${SEVERITY_CONFIG[item.severity].tone}">${escapeHtml(item.severity)}</span>
                <span class="chip public">${escapeHtml(item.serviceFamily)}</span>
            </div>
            <h3>${escapeHtml(item.serviceName)}</h3>
            <p class="section-copy">${escapeHtml(item.summary)}</p>
            <p class="meta-copy">${escapeHtml(item.category)} · Reviewed ${escapeHtml(formatDate(item.lastReviewedDate))}</p>
        </article>
    `;
}

function renderDetailPanel(item) {
    const publicReferences = item.references.filter((reference) => !isHiddenPublicSourceUrl(reference.url));
    const checklistCoverage = item.checklistCoverage?.checklistCount
        ? `
            <div class="detail-block">
                <h3>Checklist coverage</h3>
                <p class="section-copy">
                    Aggregated from ${item.checklistCoverage.itemCount || 0} checklist item${item.checklistCoverage.itemCount === 1 ? "" : "s"}
                    across ${item.checklistCoverage.checklistCount} review checklist${item.checklistCoverage.checklistCount === 1 ? "" : "s"}.
                </p>
                <ul class="detail-list">
                    ${item.checklistCoverage.checklistNames.slice(0, 4).map((name) => `<li>${escapeHtml(name)}</li>`).join("")}
                </ul>
            </div>
        `
        : "";
    const sourceLinks = publicReferences.map((reference) => `
        <li>
            <a class="inline-link" href="${escapeHtml(reference.url)}" target="_blank" rel="noreferrer">
                ${escapeHtml(reference.label)}
            </a>
            <span class="meta-copy"> · ${escapeHtml(reference.updated || "Current")}</span>
        </li>
    `).join("");

    return `
        <div>
            <div class="pill-row">
                <span class="chip ${MATURITY_CONFIG[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                <span class="chip ${SEVERITY_CONFIG[item.severity].tone}">${escapeHtml(item.severity)}</span>
                <span class="chip governed">${item.exportEligible ? "Default export" : "Override required"}</span>
            </div>
            <h2 class="detail-title">${escapeHtml(item.serviceName)}</h2>
            <p class="section-copy">${escapeHtml(item.summary)}</p>
            <div class="hero-actions">
                <button
                    class="${isInWorkspace(item.id) ? "button-secondary" : "button"}"
                    data-action="${isInWorkspace(item.id) ? "remove-from-workspace" : "add-to-workspace"}"
                    data-item-id="${escapeHtml(item.id)}"
                >
                    ${isInWorkspace(item.id) ? "Remove from workspace" : "Add to workspace"}
                </button>
                <button class="button-quiet" data-route="/workspace">Open workspace</button>
            </div>
        </div>

        <div class="warning-callout">${escapeHtml(MATURITY_CONFIG[item.maturity].warning)}</div>

        <div class="detail-block">
            <h3>Review guardrail</h3>
            <p class="section-copy">${escapeHtml(item.guardrail)}</p>
        </div>

        <div class="detail-block">
            <h3>Recommended actions</h3>
            <ul class="detail-list">
                ${item.recommendedActions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}
            </ul>
        </div>

        <div class="detail-block">
            <h3>Why this matters</h3>
            <ul class="detail-list">
                ${item.detail.limitations.map((limitation) => `<li>${escapeHtml(limitation)}</li>`).join("")}
            </ul>
        </div>

        <div class="detail-block">
            <h3>Dependencies</h3>
            <ul class="detail-list">
                ${item.detail.dependencies.length
        ? item.detail.dependencies.map((dependency) => `<li>${escapeHtml(dependency)}</li>`).join("")
        : "<li>No dependency list was captured for this item.</li>"}
            </ul>
        </div>

        <div class="detail-block">
            <h3>Test guidance</h3>
            <ul class="detail-list">
                ${item.detail.testGuidance.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}
            </ul>
        </div>

        ${checklistCoverage}

        <div class="detail-block">
            <h3>Source traceability</h3>
            <ul class="detail-list">
                ${sourceLinks || "<li>Public source link withheld for this item.</li>"}
            </ul>
        </div>

        <div class="detail-block">
            <h3>Local note</h3>
            <p class="meta-copy">Stored in this browser only. Add this service to Personal Workspace if you want the note included in your exported review pack.</p>
            <textarea
                class="textarea"
                data-note-id="${escapeHtml(item.id)}"
                placeholder="Capture a local note or follow-up question."
            >${escapeHtml(item.localNote)}</textarea>
        </div>
    `;
}

function currentRoute() {
    const pathname = normalizePath(window.location.pathname);
    const redirectTo = LEGACY_ROUTE_REDIRECTS[pathname];

    if (redirectTo) {
        return { path: pathname, title: "", mode: "public", redirectTo };
    }

    return ROUTES.find((route) => route.path === pathname) || { path: pathname, title: "Not found", mode: "public" };
}

function normalizePath(pathname) {
    if (!pathname || pathname === "/") {
        return "/";
    }

    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function handleDocumentClick(event) {
    const routeTarget = event.target.closest("[data-route]");

    if (routeTarget) {
        navigate(routeTarget.getAttribute("data-route"));
        return;
    }

    const actionTarget = event.target.closest("[data-action]");

    if (!actionTarget) {
        return;
    }

    const action = actionTarget.getAttribute("data-action");

    if (action === "reload") {
        bootstrap();
        return;
    }

    if (action === "toggle-export") {
        state.exportPanelOpen = !state.exportPanelOpen;
        render();
        return;
    }

    if (action === "download-export") {
        handleExportDownload(actionTarget.getAttribute("data-export-format") || "markdown");
        return;
    }

    if (action === "reset-filters") {
        navigate("/explorer");
        return;
    }

    if (action === "select-item") {
        const filters = currentExplorerFilters();
        filters.item = actionTarget.getAttribute("data-item-id");
        updateExplorerUrl(filters, false);
        render();
        return;
    }

    if (action === "add-to-workspace") {
        addItemToWorkspace(actionTarget.getAttribute("data-item-id"));
        render();
        return;
    }

    if (action === "remove-from-workspace") {
        removeItemFromWorkspace(actionTarget.getAttribute("data-item-id"));
        render();
        return;
    }

    if (action === "workspace-export") {
        handleWorkspaceExport(actionTarget.getAttribute("data-export-format") || "markdown");
        return;
    }

    if (action === "import-workspace") {
        const input = document.querySelector("[data-workspace-import]");
        if (input) {
            input.value = "";
            input.click();
        }
        return;
    }

    if (action === "clear-workspace") {
        if (!state.workspace.selectedItemIds.length && !cleanValue(state.workspace.globalNotes)) {
            return;
        }

        if (window.confirm("Clear the current personal workspace from this browser?")) {
            state.workspace = defaultWorkspace();
            saveWorkspace(state.workspace);
            render();
        }
    }
}

function handleDocumentInput(event) {
    const target = event.target;

    if (target.matches("[data-note-id]")) {
        const noteId = target.getAttribute("data-note-id");
        state.notes[noteId] = target.value;
        saveNotes(state.notes);

        const item = state.items.find((entry) => entry.id === noteId);
        if (item) {
            item.localNote = target.value;
        }

        touchWorkspace();
        return;
    }

    if (target.matches("[data-export-option]")) {
        state.exportOptions[target.getAttribute("data-export-option")] = target.checked;
        render();
        return;
    }

    if (target.matches("[data-workspace-field]")) {
        state.workspace[target.getAttribute("data-workspace-field")] = target.value;
        touchWorkspace();
        return;
    }

    if (currentRoute().path !== "/explorer" || !target.matches("input[name], select[name]")) {
        return;
    }

    const filters = currentExplorerFilters();
    const { name, value } = target;

    if (target.type === "checkbox") {
        const existing = new Set(filters[name]);
        if (target.checked) {
            existing.add(value);
        } else {
            existing.delete(value);
        }
        filters[name] = [...existing];
    } else {
        filters[name] = value;
    }

    filters.item = "";
    updateExplorerUrl(filters, false);
    render();
}

async function handleDocumentChange(event) {
    const target = event.target;

    if (!target.matches("[data-workspace-import]") || !target.files?.length) {
        return;
    }

    try {
        const text = await target.files[0].text();
        const payload = JSON.parse(text);
        const workspace = payload.workspace || payload;
        const importedNotes = workspace.itemNotes && typeof workspace.itemNotes === "object" ? workspace.itemNotes : {};

        state.workspace = normalizeWorkspace({
            name: workspace.name,
            globalNotes: workspace.globalNotes,
            selectedItemIds: workspace.selectedItemIds,
            createdAt: workspace.createdAt,
            updatedAt: workspace.updatedAt
        });
        state.notes = {
            ...state.notes,
            ...importedNotes
        };

        if (workspace.exportOptions && typeof workspace.exportOptions === "object") {
            state.exportOptions = {
                ...EXPORT_DEFAULTS,
                ...workspace.exportOptions
            };
        }

        saveWorkspace(state.workspace);
        saveNotes(state.notes);
        syncNotesIntoItems();
        render();
    } catch (error) {
        window.alert("The selected file is not a valid Azure Review Board workspace export.");
    }
}

function currentExplorerFilters() {
    const params = new URLSearchParams(window.location.search);
    const readList = (key) => params.getAll(key).map((value) => cleanValue(value)).filter(Boolean);

    return {
        q: cleanValue(params.get("q")),
        family: cleanValue(params.get("family")),
        service: cleanValue(params.get("service")),
        category: cleanValue(params.get("category")),
        item: cleanValue(params.get("item")),
        maturity: readList("maturity"),
        severity: readList("severity")
    };
}

function currentPathSelection() {
    const params = new URLSearchParams(window.location.search);

    return {
        type: cleanValue(params.get("type")),
        path: cleanValue(params.get("path"))
    };
}

function selectedExplorerItem(filteredItems, requestedId) {
    if (!filteredItems.length || !requestedId) {
        return null;
    }

    return filteredItems.find((item) => item.id === requestedId) || null;
}

function filterItems(items, filters) {
    const query = cleanValue(filters.q).toLowerCase();

    return items.filter((item) => {
        const matchesQuery = !query || [
            item.title,
            item.serviceName,
            item.serviceFamily,
            item.category,
            item.summary,
            item.tags.join(" ")
        ].some((value) => cleanValue(value).toLowerCase().includes(query));

        const matchesFamily = !filters.family || item.serviceFamily === filters.family;
        const matchesService = !filters.service || item.serviceName === filters.service;
        const matchesCategory = !filters.category || item.category === filters.category;
        const matchesMaturity = !filters.maturity.length || filters.maturity.includes(item.maturity);
        const matchesSeverity = !filters.severity.length || filters.severity.includes(item.severity);

        return matchesQuery && matchesFamily && matchesService && matchesCategory && matchesMaturity && matchesSeverity;
    });
}

function buildExplorerRoute(filters = {}) {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.family) params.set("family", filters.family);
    if (filters.service) params.set("service", filters.service);
    if (filters.category) params.set("category", filters.category);
    (filters.maturity || []).forEach((value) => params.append("maturity", value));
    (filters.severity || []).forEach((value) => params.append("severity", value));

    return params.toString() ? `/explorer?${params.toString()}` : "/explorer";
}

function filteredArchitecturePaths(type) {
    const matching = type
        ? ARCHITECTURE_PATHS.filter((path) => path.type === type)
        : ARCHITECTURE_PATHS;

    const available = matching.length ? matching : ARCHITECTURE_PATHS;

    return available.map((path) => ({
        ...path,
        explorerRoute: buildExplorerRoute(path.explorerFilters)
    }));
}

function selectArchitecturePath(paths, requestedId) {
    if (!paths.length) {
        return null;
    }

    return paths.find((path) => path.id === requestedId) || paths[0];
}

function updateExplorerUrl(filters, push = false) {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.family) params.set("family", filters.family);
    if (filters.service) params.set("service", filters.service);
    if (filters.category) params.set("category", filters.category);
    if (filters.item) params.set("item", filters.item);
    filters.maturity.forEach((value) => params.append("maturity", value));
    filters.severity.forEach((value) => params.append("severity", value));

    const nextUrl = params.toString() ? `/explorer?${params.toString()}` : "/explorer";
    const method = push ? "pushState" : "replaceState";
    window.history[method]({}, "", nextUrl);
}

function navigate(target) {
    if (!target) {
        return;
    }

    const url = new URL(target, window.location.origin);
    const path = normalizePath(url.pathname);

    if (path !== "/explorer" && currentRoute().path === "/explorer") {
        state.exportPanelOpen = false;
    }

    window.history.pushState({}, "", `${url.pathname}${url.search}`);
    render();
}

function calculateMetrics(items) {
    return {
        totalItems: items.length,
        gaReady: items.filter((item) => item.maturity === "GA-ready").length,
        advisory: items.filter((item) => item.maturity === "Advisory").length,
        preview: items.filter((item) => item.maturity === "Preview").length,
        highSeverity: items.filter((item) => item.severity === "High").length
    };
}

function topFamilyCards(items) {
    return Object.entries(groupBy(items, "serviceFamily"))
        .map(([family, familyItems]) => ({
            family,
            itemCount: familyItems.length,
            gaReadyCount: familyItems.filter((item) => item.maturity === "GA-ready").length,
            previewCount: familyItems.filter((item) => item.maturity === "Preview").length,
            highSeverityCount: familyItems.filter((item) => item.severity === "High").length,
            blurb: FAMILY_BLURBS[family] || "Source-backed Azure review guidance grouped for faster scanning."
        }))
        .sort((left, right) => right.itemCount - left.itemCount)
        .slice(0, 4);
}

function groupBy(items, key) {
    return items.reduce((groups, item) => {
        groups[item[key]] = groups[item[key]] || [];
        groups[item[key]].push(item);
        return groups;
    }, {});
}

function exportWarningText(options) {
    if (options.includePreview) {
        return "Preview content is included. Leadership-facing exports must disclose that preview material was deliberately added.";
    }

    if (options.includeAdvisory) {
        return "Advisory content is included. The export will show a mixed-maturity composition.";
    }

    return "Default sample export remains GA-ready only.";
}

function filterExportableItems(items, options) {
    return items.filter((item) => {
        if (item.maturity === "GA-ready") {
            return true;
        }

        if (item.maturity === "Advisory") {
            return options.includeAdvisory;
        }

        if (item.maturity === "Preview") {
            return options.includePreview;
        }

        return false;
    });
}

function selectedWorkspaceItems() {
    const order = new Map(state.workspace.selectedItemIds.map((id, index) => [id, index]));

    return state.items
        .filter((item) => order.has(item.id))
        .sort((left, right) => order.get(left.id) - order.get(right.id))
        .map((item) => ({
            ...item,
            localNote: state.notes[item.id] || item.localNote || ""
        }));
}

function isInWorkspace(itemId) {
    return state.workspace.selectedItemIds.includes(itemId);
}

function addItemToWorkspace(itemId) {
    if (!itemId || isInWorkspace(itemId)) {
        return;
    }

    state.workspace.selectedItemIds = [...state.workspace.selectedItemIds, itemId];
    touchWorkspace();
}

function removeItemFromWorkspace(itemId) {
    state.workspace.selectedItemIds = state.workspace.selectedItemIds.filter((id) => id !== itemId);
    touchWorkspace();
}

function workspaceSummary(items) {
    const maturityCounts = items.reduce((counts, item) => {
        counts[item.maturity] = (counts[item.maturity] || 0) + 1;
        return counts;
    }, {});
    const maturityMix = Object.entries(maturityCounts)
        .map(([maturity, count]) => `${maturity}: ${count}`)
        .join(" | ") || "No items";
    const noteCount = items.filter((item) => cleanValue(state.notes[item.id])).length + (cleanValue(state.workspace.globalNotes) ? 1 : 0);

    return {
        itemCount: items.length,
        noteCount,
        maturityMix,
        lastUpdated: state.workspace.updatedAt ? formatDate(state.workspace.updatedAt) : "Not updated"
    };
}

function handleExportDownload(format = "markdown") {
    const filters = currentExplorerFilters();
    const filteredItems = filterExportableItems(filterItems(state.items, filters), state.exportOptions);

    const selectedItems = filteredItems.map((item) => ({
        ...item,
        localNote: state.notes[item.id] || ""
    }));

    const exportPayload = {
        productName: PRODUCT.name,
        modeLabel: "Review Catalog",
        items: selectedItems,
        filters,
        options: state.exportOptions,
        generatedAt: new Date()
    };

    if (format === "csv") {
        const csv = buildCsvExport(exportPayload);
        downloadTextFile("azure-review-board-sample-export.csv", csv, "text/csv;charset=utf-8");
        return;
    }

    const markdown = buildMarkdownExport(exportPayload);
    downloadTextFile("azure-review-board-sample-export.md", markdown, "text/markdown;charset=utf-8");
}

function handleWorkspaceExport(format = "markdown") {
    const items = filterExportableItems(selectedWorkspaceItems(), state.exportOptions);

    if (!items.length) {
        window.alert("Add at least one export-eligible item to Workspace before exporting.");
        return;
    }

    const exportPayload = {
        productName: PRODUCT.name,
        modeLabel: "Workspace",
        items,
        filters: {
            workspace: state.workspace.name,
            source: "Workspace"
        },
        options: {
            ...state.exportOptions
        },
        generatedAt: new Date(),
        workspaceName: state.workspace.name,
        workspaceNotes: state.workspace.globalNotes,
        workspace: {
            ...state.workspace,
            itemNotes: items.reduce((notes, item) => {
                if (cleanValue(state.notes[item.id])) {
                    notes[item.id] = state.notes[item.id];
                }
                return notes;
            }, {}),
            exportOptions: state.exportOptions
        }
    };

    if (format === "csv") {
        const csv = buildCsvExport(exportPayload);
        downloadTextFile("azure-review-board-workspace.csv", csv, "text/csv;charset=utf-8");
        return;
    }

    if (format === "json") {
        const json = buildJsonExport(exportPayload);
        downloadTextFile("azure-review-board-workspace.json", json, "application/json;charset=utf-8");
        return;
    }

    const markdown = buildMarkdownExport(exportPayload);
    downloadTextFile("azure-review-board-workspace.md", markdown, "text/markdown;charset=utf-8");
}

function loadNotes() {
    try {
        return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
    } catch (error) {
        return {};
    }
}

function saveNotes(notes) {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function defaultWorkspace() {
    const now = new Date().toISOString();
    return {
        name: DEFAULT_WORKSPACE_NAME,
        globalNotes: "",
        selectedItemIds: [],
        createdAt: now,
        updatedAt: now
    };
}

function normalizeWorkspace(value = {}) {
    const fallback = defaultWorkspace();

    return {
        name: cleanValue(value.name) || fallback.name,
        globalNotes: value.globalNotes || "",
        selectedItemIds: Array.isArray(value.selectedItemIds)
            ? [...new Set(value.selectedItemIds.map((item) => cleanValue(item)).filter(Boolean))]
            : [],
        createdAt: cleanValue(value.createdAt) || fallback.createdAt,
        updatedAt: cleanValue(value.updatedAt) || fallback.updatedAt
    };
}

function loadWorkspace() {
    try {
        return normalizeWorkspace(JSON.parse(localStorage.getItem(WORKSPACE_KEY) || "{}"));
    } catch (error) {
        return defaultWorkspace();
    }
}

function saveWorkspace(workspace) {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
}

function touchWorkspace() {
    state.workspace = normalizeWorkspace({
        ...state.workspace,
        updatedAt: new Date().toISOString()
    });
    saveWorkspace(state.workspace);
}

function syncNotesIntoItems() {
    state.items.forEach((item) => {
        item.localNote = state.notes[item.id] || "";
    });
}
