export const PRODUCT = {
    name: "Azure Review Board",
    brandEyebrow: "Architecture Review",
    tagline: "Azure resilience review guidance",
    valueProposition: "Review Azure architecture decisions with source-backed availability and disaster recovery guidance."
};

export const SITE_NAV = [
    { path: "/", title: "Home" },
    { path: "/explorer", title: "Explorer" },
    { path: "/paths", title: "Architecture Paths" },
    { path: "/method", title: "Review Method" },
    { path: "/workspace", title: "Workspace" }
];

export const HOME_PAGE_COPY = {
    hero: {
        eyebrow: "Azure Resilience Review",
        title: "Review Azure architecture decisions with source-backed availability and disaster recovery guidance.",
        body: "Use curated architecture paths, service-level review items, and a local workspace to build a review pack quickly.",
        primaryCta: {
            label: "Open Explorer",
            route: "/explorer"
        },
        secondaryCta: {
            label: "Open Workspace",
            route: "/workspace"
        }
    },
    trustStrip: {
        title: "Trust by design",
        cards: [
            {
                title: "Source traceability",
                body: "Every review item links back to Microsoft guidance."
            },
            {
                title: "Maturity-aware defaults",
                body: "Preview and deprecated content are visibly marked and excluded from default export."
            },
            {
                title: "Architecture paths",
                body: "Start from the architecture problem, not just a service list."
            },
            {
                title: "Local-only workspace",
                body: "Notes stay in this browser unless you export them."
            }
        ]
    },
    pathsSection: {
        eyebrow: "Starting points",
        title: "Start from the architecture question.",
        body: "Choose a path based on the review problem you need to solve."
    },
    explorerPreview: {
        eyebrow: "Review Catalog",
        title: "Explore the catalog by service, maturity, and risk.",
        body: "Filter review items, inspect source-backed guidance, and build a review pack from the services that matter most.",
        cta: {
            label: "Open Explorer",
            route: "/explorer"
        }
    },
    methodStrip: {
        eyebrow: "Review Method",
        title: "Clear review rules. Clear export behavior.",
        body: "Every item includes maturity, severity, and source context. Non-GA content stays out of default export unless it is explicitly included.",
        cta: {
            label: "Review Method",
            route: "/method"
        }
    }
};

export const HOME_TRUST_CARDS = HOME_PAGE_COPY.trustStrip.cards;

export const METHOD_PAGE_COPY = {
    intro: {
        eyebrow: "Review Method",
        title: "How the review model works",
        body: "The review model keeps source traceability, maturity logic, and export rules visible so users can understand what they are looking at and what belongs in an exported pack."
    },
    sections: [
        {
            eyebrow: "Source logic",
            title: "Microsoft sources stay visible in the review flow.",
            body: "Every item is tied back to Microsoft documentation so the review starts from named guidance, not abstract commentary."
        },
        {
            eyebrow: "Maturity rules",
            title: "Maturity changes behavior, not just labels.",
            body: "GA-ready content is eligible by default. Advisory and preview content remain visible for review but require deliberate inclusion before export."
        },
        {
            eyebrow: "Export rules",
            title: "Exports disclose what was included.",
            body: "Review packs show the maturity mix and keep source references visible. Deprecated content stays excluded from default export."
        },
        {
            eyebrow: "Workspace boundary",
            title: "The workspace is local to this browser.",
            body: "Selections, notes, and JSON backups remain local unless the user exports them. This deployment does not create shared records or hidden workflow."
        }
    ],
    supported: [
        "Source-backed service exploration with maturity and severity filters.",
        "Architecture-path entry points that launch the explorer with guided filters.",
        "Local notes, item selection, and export in the current browser.",
        "Markdown, CSV, and JSON review-pack exports with visible maturity context."
    ],
    localOnly: [
        "Workspace selections, notes, and exports stay in the current browser unless you export them.",
        "JSON export and import preserve your local review pack without creating a server-side record.",
        "No shared review records, role assignments, approvals, or audit trails are created."
    ],
    notSupported: [
        "Shared review records, collaboration claims, or implied enterprise sign-off.",
        "Exports that hide advisory or preview content in the maturity mix.",
        "Treating deprecated or preview guidance as a default leadership baseline."
    ]
};

export const WORKSPACE_COPY = {
    header: {
        eyebrow: "Local Workspace",
        title: "Build your review pack.",
        body: "Select review items in Explorer, capture notes in this browser, and export Markdown, CSV, or JSON. No sign-in. No shared records."
    },
    steps: [
        "Select items",
        "Add notes",
        "Export pack"
    ],
    helper: "Your workspace is stored locally in this browser.",
    exportHelper: "Exports include selected items, notes, and current export settings.",
    emptyItemsTitle: "No items in your review pack",
    emptyItemsBody: "Select items in Explorer, add notes here, then export your pack.",
    emptyNotesTitle: "No item notes to capture yet",
    emptyNotesBody: "Add services to your workspace first. Their local notes will appear here for quick editing and export."
};

export const FOOTER_COPY = {
    boundaryText: "Notes stay in this browser unless you export them. This site does not create shared records.",
    links: SITE_NAV.filter((item) => item.path !== "/")
};
