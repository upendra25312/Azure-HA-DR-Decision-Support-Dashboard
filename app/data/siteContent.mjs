export const PRODUCT = {
    name: "Azure Review Board",
    valueProposition: "Source-backed Azure architecture review guidance with a clear review surface and a governed workspace path.",
    heroTitle: "Azure architecture review that separates exploration from governance.",
    heroIntro: "The review surface is open, fast, and source traceable. Governed Workspace is protected, role aware, and designed for evidence, decisions, and audit history.",
    primaryCta: {
        label: "Open Public Explorer",
        route: "/explorer"
    },
    secondaryCta: {
        label: "See Governed Workspace",
        route: "/workspace"
    },
    heroSupport: "This deployment is an open review surface. Local notes stay in your browser. Governed records require Microsoft Entra ID and protected APIs."
};

export const HOME_TRUST_CARDS = [
    {
        title: "One public job",
        body: "Explore source-backed guidance quickly without implying shared workflow or enterprise persistence."
    },
    {
        title: "Governance by default",
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
        title: "Governed Workspace",
        label: "Protected internal use",
        body: "Authenticate with Microsoft Entra ID, capture evidence, assign owners, track decisions, and audit exports in an internal deployment.",
        actionLabel: "View boundary",
        actionRoute: "/workspace"
    }
];

export const WHAT_WORKS_NOW = [
    "Public service exploration with maturity and severity filters.",
    "Source traceability from Microsoft documentation links and review dates.",
    "Local-only notes stored in the current browser.",
    "Sample exports with visible maturity composition and limitations."
];

export const REQUIRES_GOVERNED_MODE = [
    "Saved review sessions and persistent review records.",
    "Evidence capture, decision records, owners, and due dates.",
    "Export history, audit events, and role-based control.",
    "Protected APIs and Microsoft Entra ID route enforcement."
];

export const NOT_SUPPORTED = [
    "Public write access to shared review records.",
    "Fake collaboration, fake approvals, or implied enterprise sign-off.",
    "Exports that hide advisory or preview content in the maturity mix.",
    "Treating deprecated or preview guidance as a default leadership baseline."
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
        body: "Public users can explore, filter, and save local notes in their own browser. No shared review records are created in this deployment, and no enterprise workflow is implied."
    }
];

export const GOVERNED_MODULES = [
    {
        title: "Review workspace",
        body: "Persistent session record, owner, due date, and decision status."
    },
    {
        title: "Evidence register",
        body: "Links, attachments, and proof references tied to individual review items."
    },
    {
        title: "Decision log",
        body: "Approved patterns, exceptions, rationale, and review timestamps."
    },
    {
        title: "Export history",
        body: "Who exported, when they exported, what maturity mix was included, and which override was used."
    }
];

export const REPORTING_RULES = [
    "GA-ready content is included by default.",
    "Advisory and preview content require explicit inclusion.",
    "Deprecated content remains excluded by default and should be isolated when displayed.",
    "Every report shows the maturity mix, source traceability, and who generated it in governed mode."
];
