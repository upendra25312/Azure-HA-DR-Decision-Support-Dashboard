export const PRODUCT = {
    name: "Azure Review Board",
    valueProposition: "Source-backed Azure architecture review guidance with a clear review surface and a local personal workspace.",
    heroTitle: "Azure architecture review that turns findings into a clean review pack.",
    heroIntro: "The review surface is open, fast, and source traceable. Personal Workspace keeps selected items, notes, and exports in this browser.",
    primaryCta: {
        label: "Open Public Explorer",
        route: "/explorer"
    },
    secondaryCta: {
        label: "Open Personal Workspace",
        route: "/workspace"
    },
    heroSupport: "This deployment stores notes, selections, and exports locally in your browser. No sign-in. No shared records."
};

export const HOME_TRUST_CARDS = [
    {
        title: "One public job",
        body: "Explore source-backed guidance quickly without implying shared workflow or enterprise persistence."
    },
    {
        title: "Safe export defaults",
        body: "GA-ready content exports by default. Advisory and preview content require deliberate inclusion."
    },
    {
        title: "Traceable sources",
        body: "Every review item keeps Microsoft documentation links, review dates, and clear maturity labeling."
    },
    {
        title: "Honest boundaries",
        body: "The review surface does not claim approvals, sign-off, shared notes, or hidden enterprise controls."
    }
];

export const MODE_CARDS = [
    {
        title: "Review Explorer",
        label: "Open access",
        body: "Browse services, filter by maturity and severity, inspect source traceability, and save local-only notes in this browser.",
        actionLabel: "Explore now",
        actionRoute: "/explorer"
    },
    {
        title: "Personal Workspace",
        label: "Local only",
        body: "Keep a shortlist of services, capture notes, and export a review pack from this browser without signing in.",
        actionLabel: "Open workspace",
        actionRoute: "/workspace"
    }
];

export const WHAT_WORKS_NOW = [
    "Public service exploration with maturity and severity filters.",
    "Source traceability from Microsoft documentation links and review dates.",
    "Personal workspace notes and shortlisted review items stored in the current browser.",
    "Markdown, CSV, and JSON exports with visible maturity composition and limitations."
];

export const WHAT_STAYS_LOCAL = [
    "Workspace selections, notes, and exports stay in the current browser unless you export them.",
    "JSON export and import preserve your local review pack without creating a server-side record.",
    "No shared review records, role assignments, or approval workflow are created.",
    "No audit trail or export history is captured by this deployment."
];

export const NOT_SUPPORTED = [
    "Shared review records, fake collaboration, or implied enterprise sign-off.",
    "Exports that hide advisory or preview content in the maturity mix.",
    "Treating deprecated or preview guidance as a default leadership baseline.",
    "Assuming browser-local notes are durable team records without exporting them."
];

export const METHOD_SECTIONS = [
    {
        eyebrow: "What this is",
        title: "A review accelerator, not a sign-off engine.",
        body: "The product normalizes Azure continuity guidance into a review surface that is easier to scan, filter, and discuss. It supports preparation and structured review. It does not replace accountable architecture approval."
    },
    {
        eyebrow: "How content is curated",
        title: "Microsoft sources first, maturity second, export posture third.",
        body: "Each item stays tied to named Microsoft documentation. We then classify the review item by maturity so the product can change behavior, not just show a badge. That maturity posture directly affects exports."
    },
    {
        eyebrow: "Public boundary",
        title: "The review surface stays local and lightweight.",
        body: "Public users can explore, filter, save notes, build a personal workspace, and export their review pack. No shared review records are created in this deployment."
    }
];
