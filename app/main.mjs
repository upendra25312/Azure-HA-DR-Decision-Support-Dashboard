import { loadAuthState, hasRole } from "./auth.mjs";
import { buildCsvExport, buildMarkdownExport, downloadTextFile } from "./exporter.mjs";
import {
    FAMILY_BLURBS,
    MATURITY_CONFIG,
    REVIEW_META,
    ROLE_DEFINITIONS,
    SEVERITY_CONFIG
} from "./data/reviewMeta.mjs";
import {
    GOVERNED_MODULES,
    HOME_TRUST_CARDS,
    METHOD_SECTIONS,
    MODE_CARDS,
    NOT_SUPPORTED,
    PRODUCT,
    REPORTING_RULES,
    REQUIRES_GOVERNED_MODE,
    WHAT_WORKS_NOW
} from "./data/siteContent.mjs";
import {
    canonicalizeServiceName,
    cleanValue,
    escapeHtml,
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
const ROUTES = [
    { path: "/", title: "Home", mode: "public" },
    { path: "/explorer", title: "Explorer", mode: "public" },
    { path: "/services", title: "Services", mode: "public" },
    { path: "/method", title: "Method", mode: "public" },
    { path: "/workspace", title: "Review Workspace", mode: "governed" },
    { path: "/reports", title: "Reports", mode: "governed" },
    { path: "/admin", title: "Admin", mode: "governed" }
];
const LEGACY_ROUTE_REDIRECTS = {
    "/roadmap": "/method"
};

const GOVERNED_ROUTE_RULES = {
    "/workspace": ["authenticated"],
    "/reports": ["authenticated"],
    "/admin": ["admin"]
};

const EXPORT_DEFAULTS = {
    includeAdvisory: false,
    includePreview: false,
    includeNotes: true
};

const state = {
    auth: null,
    items: [],
    sources: [],
    families: [],
    services: [],
    categories: [],
    loading: true,
    error: "",
    exportPanelOpen: false,
    exportOptions: { ...EXPORT_DEFAULTS },
    notes: loadNotes()
};

const app = document.getElementById("app");

document.addEventListener("click", handleDocumentClick);
document.addEventListener("input", handleDocumentInput);
window.addEventListener("popstate", render);

bootstrap();

async function bootstrap() {
    render();

    const [auth, dataResult] = await Promise.all([
        loadAuthState(),
        loadCatalogData()
    ]);

    state.auth = auth;

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
    state.loading = false;
    render();
}

async function loadCatalogData() {
    try {
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
    ]
        .map((url) => cleanValue(url))
        .filter(Boolean);

    sourceEntries.slice(0, 3).forEach((source) => {
        candidates.push({
            label: cleanValue(source["Source Title"]) || "Microsoft source",
            url: cleanValue(source["Source URL"]),
            updated: cleanValue(source["Last Updated (If Available)"]) || cleanValue(source["Date Accessed"])
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
            ${renderTopbar(route)}
            ${renderPage(route)}
            ${renderFooter()}
        </div>
    `;

    hydrateExplorerSelection(route);
}

function renderPage(route) {
    if (state.loading) {
        return `
            <main id="main" class="page">
                <section class="loading-state">
                    <div>
                        <h1 class="hero-title">Loading the public review catalog.</h1>
                        <p class="hero-copy">Applying source-backed review data, maturity rules, and governed route boundaries.</p>
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
        return renderHomePage();
    case "/explorer":
        return renderExplorerPage();
    case "/services":
        return renderServicesPage();
    case "/method":
        return renderMethodPage();
    case "/workspace":
        return renderGovernedWorkspacePage();
    case "/reports":
        return renderReportsPage();
    case "/admin":
        return renderAdminPage();
    default:
        return renderNotFoundPage();
    }
}

function renderTopbar(route) {
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
                ${ROUTES.map((entry) => {
        const locked = entry.mode === "governed" && !canAccessRoute(entry.path);
        return `
                        <button
                            class="nav-link ${route.path === entry.path ? "is-active" : ""} ${locked ? "is-locked" : ""}"
                            data-route="${entry.path}"
                        >
                            ${escapeHtml(entry.title)}
                        </button>
                    `;
    }).join("")}
            </nav>
        </header>
    `;
}

function renderHomePage() {
    const metrics = calculateMetrics(state.items);
    const familyCards = topFamilyCards(state.items);

    return `
        <main id="main" class="page">
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
                        <p class="section-copy">The homepage leads to exploration first. Enterprise workflow stays on the governed side and never gets implied by the review surface.</p>
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
                    ${renderSimpleCard("Public notes", "Allowed, but stored in the current browser only. No shared review record is created here.")}
                    ${renderSimpleCard("Governed mode", "Adds Microsoft Entra ID, evidence, decision tracking, audit history, and role-aware access.")}
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
                        <h2 class="section-title">What works now and where governed deployment begins.</h2>
                    </div>
                </div>
                <div class="checklist-grid">
                    ${renderChecklistCard("What works now", WHAT_WORKS_NOW)}
                    ${renderChecklistCard("What requires governed mode", REQUIRES_GOVERNED_MODE)}
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
    const exportWarning = exportWarningText(state.exportOptions);

    return `
        <main id="main" class="page">
            <section class="page-hero">
                <p class="eyebrow">Review Catalog</p>
                <div class="section-header">
                    <div>
                        <h1 class="hero-title">Explore the review catalog by service, maturity, and risk.</h1>
                        <p class="hero-copy">This is the main public action. Browse the service posture, inspect sources, and save local-only notes without implying governed workflow.</p>
                    </div>
                    <div class="pill-row">
                        <span class="chip public">Open access</span>
                        <span class="chip ${filteredItems.some((item) => item.maturity === "Preview") ? "preview" : "ga-ready"}">${filteredItems.length} results</span>
                    </div>
                </div>
            </section>

            <section class="panel">
                <div class="toolbar">
                    <div>
                        <h2 class="section-title">Sample export</h2>
                        <p class="section-copy">Download the current filtered review pack as Markdown or CSV. Default export is GA-ready only. Advisory and preview content require explicit inclusion.</p>
                    </div>
                    <div class="hero-actions">
                        <button class="button-secondary" data-action="toggle-export">
                            ${state.exportPanelOpen ? "Hide export options" : "Show export options"}
                        </button>
                        <button class="button" data-action="download-export" data-export-format="markdown">Download Markdown</button>
                        <button class="button-secondary" data-action="download-export" data-export-format="csv">Download CSV</button>
                    </div>
                </div>
                ${state.exportPanelOpen ? `
                    <div class="export-panel">
                        <label class="filter-chip-row">
                            <input type="checkbox" data-export-option="includeAdvisory" ${state.exportOptions.includeAdvisory ? "checked" : ""}>
                            Include advisory content
                        </label>
                        <label class="filter-chip-row">
                            <input type="checkbox" data-export-option="includePreview" ${state.exportOptions.includePreview ? "checked" : ""}>
                            Include preview content
                        </label>
                        <label class="filter-chip-row">
                            <input type="checkbox" data-export-option="includeNotes" ${state.exportOptions.includeNotes ? "checked" : ""}>
                            Include local notes
                        </label>
                        <div class="warning-callout">${escapeHtml(exportWarning)}</div>
                    </div>
                ` : ""}
            </section>

            <section class="detail-grid">
                <aside class="panel filter-panel" aria-label="Explorer filters">
                    <div class="filter-group">
                        <label for="search">Search</label>
                        <input id="search" class="input" type="search" name="q" value="${escapeHtml(filters.q)}" placeholder="Search service, tag, or guidance">
                    </div>
                    <div class="filter-group">
                        <label for="serviceFamily">Service family</label>
                        <select id="serviceFamily" class="select" name="family">
                            ${renderSelectOptions("All families", state.families, filters.family)}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="serviceName">Service</label>
                        <select id="serviceName" class="select" name="service">
                            ${renderSelectOptions("All services", state.services, filters.service)}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="category">Category</label>
                        <select id="category" class="select" name="category">
                            ${renderSelectOptions("All categories", state.categories, filters.category)}
                        </select>
                    </div>
                    <div class="filter-group">
                        <span class="field-label">Maturity</span>
                        ${renderCheckboxGroup("maturity", Object.keys(MATURITY_CONFIG), filters.maturity)}
                    </div>
                    <div class="filter-group">
                        <span class="field-label">Severity</span>
                        ${renderCheckboxGroup("severity", Object.keys(SEVERITY_CONFIG), filters.severity)}
                    </div>
                    <button class="button-quiet" data-action="reset-filters">Reset filters</button>
                </aside>

                <section class="panel">
                    <div class="section-header">
                        <div>
                            <p class="eyebrow">Results</p>
                            <h2 class="section-title">${filteredItems.length ? `${filteredItems.length} review items` : "No matching items"}</h2>
                            <p class="section-copy">Preview items are visually distinct and remain out of the default export baseline.</p>
                        </div>
                    </div>
                    ${filteredItems.length ? `
                        <div class="review-list">
                            ${filteredItems.map((item) => renderReviewCard(item, selectedItem?.id === item.id)).join("")}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div>
                                <h3>No review items match this filter set.</h3>
                                <p class="section-copy">Remove a service or maturity filter, or reset the explorer to the default GA-first posture.</p>
                            </div>
                        </div>
                    `}
                </section>

                <aside class="detail-panel" aria-label="Review detail">
                    ${selectedItem ? renderDetailPanel(selectedItem) : `
                        <div class="empty-state">
                            <div>
                                <h3>Select a review item.</h3>
                                <p class="section-copy">The detail panel shows guardrails, source traceability, notes, and export posture for the selected service.</p>
                            </div>
                        </div>
                    `}
                </aside>
            </section>
        </main>
    `;
}

function renderServicesPage() {
    const serviceCards = state.items.map((item) => `
        <article class="service-card">
            <div class="pill-row">
                <span class="chip ${MATURITY_CONFIG[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                <span class="chip ${SEVERITY_CONFIG[item.severity].tone}">${escapeHtml(item.severity)}</span>
            </div>
            <h2 class="service-title">${escapeHtml(item.serviceName)}</h2>
            <p class="section-copy">${escapeHtml(item.summary)}</p>
            <p class="meta-copy">${escapeHtml(item.serviceFamily)} · ${escapeHtml(item.category)}</p>
            <div class="hero-actions">
                <button class="button-quiet" data-route="/explorer?service=${encodeURIComponent(item.serviceName)}&item=${encodeURIComponent(item.id)}">Open in explorer</button>
            </div>
        </article>
    `).join("");

    return `
        <main id="main" class="page">
            <section class="page-hero">
                <p class="eyebrow">Service catalog</p>
                <h1 class="hero-title">Service-first navigation.</h1>
                <p class="hero-copy">This page exists to get users into the explorer quickly. Each card opens the detailed review posture for one Azure service.</p>
            </section>
            <section class="section">
                <div class="service-grid">
                    ${serviceCards}
                </div>
            </section>
        </main>
    `;
}

function renderMethodPage() {
    return `
        <main id="main" class="page">
            <section class="page-hero">
                <p class="eyebrow">Method and about</p>
                <h1 class="hero-title">Precise copy, clear boundaries, and no fake enterprise claims.</h1>
                <p class="hero-copy">The method page says what works now, what belongs in governed mode, and what the product does not do.</p>
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
                ${renderChecklistCard("What requires governed mode", REQUIRES_GOVERNED_MODE)}
                ${renderChecklistCard("What is not supported", NOT_SUPPORTED)}
            </section>
        </main>
    `;
}

function renderGovernedWorkspacePage() {
    const accessAllowed = canAccessRoute("/workspace");

    return `
        <main id="main" class="page">
            <section class="page-hero">
                <p class="eyebrow">Governed workspace</p>
                <h1 class="hero-title">Protected review work starts here, not in the open review surface.</h1>
                <p class="hero-copy">This route is reserved for an internal deployment with Microsoft Entra ID, protected APIs, and durable review records.</p>
            </section>
            ${accessAllowed ? renderGovernedAuthenticatedShell() : renderGovernedGate("/workspace")}
        </main>
    `;
}

function renderReportsPage() {
    const accessAllowed = canAccessRoute("/reports");

    return `
        <main id="main" class="page">
            <section class="page-hero">
                <p class="eyebrow">Reports and exports</p>
                <h1 class="hero-title">Leadership-ready exports need governed controls.</h1>
                <p class="hero-copy">Review surface exports are samples. Governed exports record who exported, when they exported, and what maturity mix was included.</p>
            </section>
            ${accessAllowed ? `
                <section class="governed-grid">
                    ${REPORTING_RULES.map((rule) => renderSimpleCard("Export rule", rule)).join("")}
                </section>
                <section class="panel">
                    <div class="locked-banner">
                        Authenticated identity detected: ${escapeHtml(state.auth.displayName)}. Connect the governed API layer to enable report history, export manifests, and audit events.
                    </div>
                </section>
            ` : renderGovernedGate("/reports")}
        </main>
    `;
}

function renderAdminPage() {
    if (!state.auth?.isAuthenticated) {
        return `
            <main id="main" class="page">
                <section class="page-hero">
                    <p class="eyebrow">Admin</p>
                    <h1 class="hero-title">Admin controls stay off the public surface.</h1>
                    <p class="hero-copy">Role management, source baselines, and policy controls belong to the governed deployment only.</p>
                </section>
                ${renderGovernedGate("/admin")}
            </main>
        `;
    }

    if (!hasRole(state.auth, ["admin"])) {
        return `
            <main id="main" class="page">
                <section class="page-hero">
                    <p class="eyebrow">Admin</p>
                    <h1 class="hero-title">Admin role required.</h1>
                    <p class="hero-copy">This route is intentionally protected. Viewer, reviewer, and architect roles should not see admin controls.</p>
                </section>
                <section class="panel">
                    <div class="warning-callout">Authenticated as ${escapeHtml(state.auth.displayName)}, but no admin role was detected in this session.</div>
                    <div class="governed-grid">
                        ${ROLE_DEFINITIONS.map((role) => renderSimpleCard(role.title, role.description)).join("")}
                    </div>
                </section>
            </main>
        `;
    }

    return `
        <main id="main" class="page">
            <section class="page-hero">
                <p class="eyebrow">Admin</p>
                <h1 class="hero-title">Governed administration shell.</h1>
                <p class="hero-copy">This page exists to show the boundary: admin users manage policy, sources, roles, and export controls in the internal deployment.</p>
            </section>
            <section class="governed-grid">
                ${renderSimpleCard("Role assignments", "Manage Viewer, Reviewer, Architect, and Admin role membership through Microsoft Entra ID groups.")}
                ${renderSimpleCard("Source baseline", "Approve source register changes and review-date expectations before they affect exports.")}
                ${renderSimpleCard("Export policy", "Decide which maturity states require explicit override and which report templates are available.")}
                ${renderSimpleCard("Audit retention", "Control retention, legal hold, and audit event forwarding to Log Analytics and SIEM tooling.")}
            </section>
        </main>
    `;
}

function renderGovernedAuthenticatedShell() {
    return `
        <section class="panel">
            <div class="info-callout">
                Authenticated as ${escapeHtml(state.auth.displayName)}. This public repository ships the governed shell and route protections, but not a live review-record API.
            </div>
        </section>
        <section class="workspace-grid">
            ${GOVERNED_MODULES.map((module) => `
                <article class="governed-card">
                    <h2 class="section-title">${escapeHtml(module.title)}</h2>
                    <p class="section-copy">${escapeHtml(module.body)}</p>
                </article>
            `).join("")}
        </section>
        <section class="panel">
            <h2 class="section-title">Role model</h2>
            <div class="governed-grid">
                ${ROLE_DEFINITIONS.map((role) => renderSimpleCard(role.title, role.description)).join("")}
            </div>
        </section>
    `;
}

function renderGovernedGate(routePath) {
    return `
        <section class="panel">
            <div class="locked-banner">
                Governed mode requires Microsoft Entra ID and protected APIs. Public visitors can inspect the boundary, but cannot access shared review records here.
            </div>
            <div class="hero-actions">
                <a class="button" href="/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(routePath)}">Sign in with Microsoft Entra ID</a>
                <button class="button-secondary" data-route="/method">Review the product boundary</button>
            </div>
        </section>
    `;
}

function renderNotFoundPage() {
    return `
        <main id="main" class="page">
            <section class="error-state">
                <div>
                    <h1 class="hero-title">That route does not exist.</h1>
                    <p class="hero-copy">Use the public explorer for open review or the governed routes for protected internal work.</p>
                    <button class="button" data-route="/">Return home</button>
                </div>
            </section>
        </main>
    `;
}

function renderFooter() {
    return `
        <footer class="footer">
            <p class="footer-note">
                Review Surface: open exploration, source traceability, and local-only notes.
                Governed Workspace: protected internal deployment with Microsoft Entra ID, durable records, and audit-friendly export behavior.
            </p>
            <div class="footer-links">
                <button class="button-quiet" data-route="/explorer">Explorer</button>
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

        <div class="detail-block">
            <h3>Source traceability</h3>
            <ul class="detail-list">
                ${sourceLinks || "<li>Public source link withheld for this item.</li>"}
            </ul>
        </div>

        <div class="detail-block">
            <h3>Local-only demo note</h3>
            <p class="meta-copy">Stored in this browser only. Governed mode is required for shared notes, evidence, and decision history.</p>
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

function canAccessRoute(path) {
    const requiredRoles = GOVERNED_ROUTE_RULES[path];

    if (!requiredRoles) {
        return true;
    }

    return hasRole(state.auth, requiredRoles);
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
        return;
    }

    if (target.matches("[data-export-option]")) {
        state.exportOptions[target.getAttribute("data-export-option")] = target.checked;
        render();
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

function selectedExplorerItem(filteredItems, requestedId) {
    if (!filteredItems.length) {
        return null;
    }

    return filteredItems.find((item) => item.id === requestedId) || filteredItems[0];
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
        preview: items.filter((item) => item.maturity === "Preview").length
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

function handleExportDownload(format = "markdown") {
    const filters = currentExplorerFilters();
    const filteredItems = filterItems(state.items, filters).filter((item) => {
        if (item.maturity === "GA-ready") {
            return true;
        }

        if (item.maturity === "Advisory") {
            return state.exportOptions.includeAdvisory;
        }

        if (item.maturity === "Preview") {
            return state.exportOptions.includePreview;
        }

        return false;
    });

    const selectedItems = filteredItems.map((item) => ({
        ...item,
        localNote: state.notes[item.id] || ""
    }));

    const exportPayload = {
        productName: PRODUCT.name,
        modeLabel: "Review Surface",
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

function hydrateExplorerSelection(route) {
    if (route.path !== "/explorer") {
        return;
    }

    const filters = currentExplorerFilters();
    const filteredItems = filterItems(state.items, filters);

    if (filteredItems.length && !filters.item) {
        filters.item = filteredItems[0].id;
        updateExplorerUrl(filters, false);
    }
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
