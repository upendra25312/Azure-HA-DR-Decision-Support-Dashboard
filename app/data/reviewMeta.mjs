export const ROLE_DEFINITIONS = [
    {
        id: "viewer",
        title: "Viewer",
        description: "Read governed review records and exported outputs."
    },
    {
        id: "reviewer",
        title: "Reviewer",
        description: "Update review status, notes, evidence links, and export packages."
    },
    {
        id: "architect",
        title: "Architect",
        description: "Approve architecture decisions, record exceptions, and sign maturity overrides."
    },
    {
        id: "admin",
        title: "Admin",
        description: "Manage roles, source baselines, export policy, and audit settings."
    }
];

export const MATURITY_CONFIG = {
    "GA-ready": {
        label: "GA-ready",
        tone: "ga-ready",
        chip: "GA-ready",
        defaultExport: true,
        overrideRequired: false,
        warning: "Included in sample exports by default."
    },
    Advisory: {
        label: "Advisory",
        tone: "advisory",
        chip: "Advisory",
        defaultExport: false,
        overrideRequired: true,
        warning: "Advisory content is excluded from default export and must be included deliberately."
    },
    Preview: {
        label: "Preview",
        tone: "preview",
        chip: "Preview",
        defaultExport: false,
        overrideRequired: true,
        warning: "Preview content is visible for discovery, but never included by default."
    },
    Deprecated: {
        label: "Deprecated",
        tone: "deprecated",
        chip: "Deprecated",
        defaultExport: false,
        overrideRequired: true,
        warning: "Deprecated content is isolated and excluded from export by default."
    }
};

export const SEVERITY_CONFIG = {
    High: {
        label: "High",
        tone: "high"
    },
    Medium: {
        label: "Medium",
        tone: "medium"
    },
    Low: {
        label: "Low",
        tone: "low"
    }
};

export const FAMILY_BLURBS = {
    Compute: "Application and workload services where regional continuity depends on stack-level design, not just the compute control plane.",
    Databases: "Managed and distributed data services where replication semantics and failover behavior must stay explicit.",
    "Storage and Data Services": "Platform storage choices that are often mistaken for DR when only local or zonal redundancy is enabled.",
    "Integration and Messaging": "Broker and API layers where continuity depends on message durability, aliasing, and tier-specific features.",
    "Identity, Security, and Platform Dependencies": "Ingress, identity, and platform dependencies that often decide whether failover actually works.",
    "AI / Platform Services": "AI services where regional continuity, quota parity, and service-specific support remain design-time concerns.",
    "Business Applications": "SaaS and packaged platforms that need product-specific review rather than generic platform assumptions."
};

export const REVIEW_META = {
    "Azure SQL Database": {
        title: "Azure SQL Database continuity posture",
        severity: "High",
        maturity: "GA-ready",
        tags: ["sql", "zone redundancy", "failover groups", "data"],
        serviceFamily: "Databases",
        category: "Database",
        summary: "Strong in-region platform HA is available, but regional DR only starts when cross-region features and client failover behavior are designed and tested together.",
        guardrail: "Do not describe zone redundancy as regional DR.",
        recommendedActions: [
            "Validate tier and regional support for zone redundancy before setting the baseline.",
            "Use failover groups when connection continuity matters across multiple databases.",
            "Record acceptable replication lag before exporting leadership-ready conclusions."
        ]
    },
    "Azure Storage Account": {
        title: "Azure Storage redundancy review posture",
        severity: "Medium",
        maturity: "GA-ready",
        tags: ["storage", "zrs", "gzrs", "failover"],
        serviceFamily: "Storage and Data Services",
        category: "Storage",
        summary: "Storage redundancy options are well documented, but the review must still separate local or zonal protection from true cross-region continuity.",
        guardrail: "LRS and ZRS are not regional DR strategies.",
        recommendedActions: [
            "Align redundancy choice with required read behavior in the secondary region.",
            "Test planned failover procedures before calling the pattern leadership ready.",
            "Disclose replication lag whenever GRS or GZRS is part of the export."
        ]
    },
    "Azure App Service": {
        title: "Azure App Service web tier posture",
        severity: "Medium",
        maturity: "GA-ready",
        tags: ["web", "premium", "front door", "duplicate region"],
        serviceFamily: "Compute",
        category: "Web application",
        summary: "App Service can provide stable in-region HA on supported Premium plans, but regional continuity still depends on a duplicated application stack and replicated dependencies.",
        guardrail: "App Service remains a single-region service even when zone redundant.",
        recommendedActions: [
            "Keep application state out of local App Service storage.",
            "Duplicate certificates, secrets, and configuration in both regions.",
            "Route failover through a deliberate global traffic layer."
        ]
    },
    "Azure Key Vault": {
        title: "Azure Key Vault secret dependency posture",
        severity: "Low",
        maturity: "GA-ready",
        tags: ["identity", "secrets", "dependency", "paired region"],
        serviceFamily: "Identity, Security, and Platform Dependencies",
        category: "Security dependency",
        summary: "Key Vault has strong built-in resiliency, but enterprise reviews still need to check application dependency behavior, regional access patterns, and break-glass design.",
        guardrail: "Do not present built-in resiliency as a substitute for dependency testing.",
        recommendedActions: [
            "Validate application retry behavior against transient Key Vault failures.",
            "Document secret access dependencies in the wider failover runbook.",
            "Keep break-glass access procedures outside the open review surface."
        ]
    },
    "Azure Service Bus": {
        title: "Azure Service Bus durability posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["messaging", "premium", "geo-replication", "alias"],
        serviceFamily: "Integration and Messaging",
        category: "Messaging",
        summary: "Service Bus can support strong continuity patterns, but message durability and promotion semantics remain easy to misstate without tier-aware review.",
        guardrail: "Metadata Geo-DR is not message-data protection.",
        recommendedActions: [
            "Confirm whether queued message durability is a hard requirement or an acceptable trade-off.",
            "Use Premium tier when cross-region continuity must stay explicit.",
            "Review RBAC, networking, and alias behavior as part of every export."
        ]
    },
    "Azure Virtual Machines": {
        title: "Azure Virtual Machines infrastructure posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["iaas", "site recovery", "zones", "runbooks"],
        serviceFamily: "Compute",
        category: "Infrastructure",
        summary: "VM continuity stays architecture-dependent. Azure features help, but traffic rerouting, data replication, and failover runbooks remain customer-owned.",
        guardrail: "A single zonal VM is not a disaster recovery design.",
        recommendedActions: [
            "Validate both traffic rerouting and data replication paths.",
            "Treat Site Recovery as one control in a wider regional pattern.",
            "Require drill evidence before using VM patterns in decision packs."
        ]
    },
    "Azure Cosmos DB": {
        title: "Azure Cosmos DB topology posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["cosmos", "multi-region", "consistency", "restore"],
        serviceFamily: "Databases",
        category: "Distributed database",
        summary: "Cosmos DB guidance is powerful but topology-sensitive. Review outputs must stay explicit about account shape, consistency, and region failover timing.",
        guardrail: "Do not treat one Cosmos DB topology as representative of the whole service.",
        recommendedActions: [
            "Capture account topology and consistency requirements before review.",
            "Test SDK preferred-region behavior and region offline procedures.",
            "Escalate restore-path timelines in leadership-ready material."
        ]
    },
    "Azure Front Door": {
        title: "Azure Front Door ingress posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["ingress", "global routing", "front door", "origins"],
        serviceFamily: "Identity, Security, and Platform Dependencies",
        category: "Global ingress",
        summary: "Front Door improves global ingress resiliency, but it is not the whole continuity strategy and can still require an alternate ingress path for mission-critical cases.",
        guardrail: "Do not present Front Door alone as end-to-end DR.",
        recommendedActions: [
            "Check that multiple healthy origins exist before calling failover ready.",
            "Record whether a secondary ingress path is required for the workload tier.",
            "Validate origin health endpoints and failback procedures."
        ]
    },
    "Azure Application Gateway": {
        title: "Azure Application Gateway regional posture",
        severity: "Medium",
        maturity: "Advisory",
        tags: ["regional ingress", "waf", "v2", "zone redundancy"],
        serviceFamily: "Identity, Security, and Platform Dependencies",
        category: "Regional ingress",
        summary: "Application Gateway can be strong inside a region, but regional continuity still requires a second gateway and a duplicated backend stack.",
        guardrail: "Gateway HA does not protect the backend tier.",
        recommendedActions: [
            "Pair every regional gateway review with backend parity checks.",
            "Make the global routing layer visible in every DR export.",
            "Validate WAF policy parity across regions."
        ]
    },
    "API Management": {
        title: "API Management tier posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["api", "premium classic", "multi-region", "gateway"],
        serviceFamily: "Integration and Messaging",
        category: "API gateway",
        summary: "API Management guidance is credible only when tier distinctions stay explicit. Premium-class capabilities should not be implied for lower tiers.",
        guardrail: "Do not generalize Premium classic multi-region behavior to all tiers.",
        recommendedActions: [
            "Record the exact tier under review before any export is generated.",
            "Expose certificate, domain, and backend parity dependencies.",
            "Use advisory export posture unless the tier posture is fully confirmed."
        ]
    },
    "Azure VPN Gateway": {
        title: "Azure VPN Gateway network posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["network", "hybrid", "active-active", "bgp"],
        serviceFamily: "Identity, Security, and Platform Dependencies",
        category: "Hybrid connectivity",
        summary: "VPN Gateway can improve Azure-side resilience, but enterprise continuity still depends on on-premises device diversity, tunnel design, and routing validation.",
        guardrail: "A managed gateway does not remove the on-premises single point of failure.",
        recommendedActions: [
            "Check remote device support for active-active or equivalent redundancy.",
            "Require routing drill evidence from both Azure and on-premises perspectives.",
            "Keep hybrid dependencies visible in every architecture export."
        ]
    },
    "Azure Virtual WAN": {
        title: "Azure Virtual WAN topology posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["virtual wan", "transit", "multi-hub", "routing"],
        serviceFamily: "Identity, Security, and Platform Dependencies",
        category: "Transit networking",
        summary: "Virtual WAN provides strong hub-level resilience, but regional DR starts only when the network is designed and tested across multiple hubs and regions.",
        guardrail: "A single hub is not regional DR.",
        recommendedActions: [
            "Capture hub placement and route intent before concluding maturity.",
            "Test path selection under degraded conditions, not only normal failover.",
            "Escalate routing asymmetry and capacity risks into leadership summaries."
        ]
    },
    "Azure Kubernetes Service (AKS)": {
        title: "AKS platform posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["aks", "containers", "zones", "dependency-aware"],
        serviceFamily: "Compute",
        category: "Managed Kubernetes",
        summary: "AKS can support strong availability, but the platform only becomes decision ready when cluster design, dependent services, and operational runbooks are reviewed together.",
        guardrail: "Managed control planes do not remove the need for multi-region application design.",
        recommendedActions: [
            "Review node pool, zone, and dependency placement together.",
            "Check ingress, state, secret, and registry dependencies before export.",
            "Treat AKS guidance as advisory until operational drills are recorded."
        ]
    },
    "Azure Functions": {
        title: "Azure Functions hosting posture",
        severity: "Medium",
        maturity: "Advisory",
        tags: ["serverless", "hosting plan", "dependencies", "web"],
        serviceFamily: "Compute",
        category: "Serverless",
        summary: "Functions guidance depends heavily on the hosting plan, state handling, and dependent services. The compute layer alone is not the continuity answer.",
        guardrail: "Do not separate Functions resiliency from storage, secrets, and ingress dependencies.",
        recommendedActions: [
            "Document the chosen hosting plan and scale characteristics.",
            "Review trigger and dependency durability before any export leaves the tool.",
            "Use local demo notes to capture missing dependency evidence."
        ]
    },
    "Azure OpenAI": {
        title: "Azure OpenAI regional posture",
        severity: "High",
        maturity: "Advisory",
        tags: ["azure openai", "quota", "duplicate deployment", "gateway"],
        serviceFamily: "AI / Platform Services",
        category: "AI inference",
        summary: "Azure OpenAI continuity depends on duplicate regional deployments, quota parity, fallback routing, and client behavior. These are design-time controls, not UI claims.",
        guardrail: "Do not imply regional continuity unless duplicate capacity and routing are both in place.",
        recommendedActions: [
            "Check quota parity in every target region before export.",
            "Separate model deployment continuity from application continuity.",
            "Require explicit override before including this posture in leadership packs."
        ]
    },
    "Microsoft Fabric": {
        title: "Microsoft Fabric experience posture",
        severity: "High",
        maturity: "Preview",
        tags: ["fabric", "experience-specific", "onelake", "read-only"],
        serviceFamily: "AI / Platform Services",
        category: "Analytics platform",
        summary: "Fabric guidance stays experience-specific. OneLake-backed paths can be strong, but broad platform statements remain risky without workload context.",
        guardrail: "Do not export Fabric guidance as GA-ready unless the experience and data path are explicitly confirmed.",
        recommendedActions: [
            "Capture the exact Fabric experience under review.",
            "Validate read-only and recovery behavior for the chosen workload.",
            "Keep Fabric isolated from default exports unless manually included."
        ]
    },
    "Dynamics 365 (D365)": {
        title: "Dynamics 365 continuity posture",
        severity: "High",
        maturity: "Preview",
        tags: ["d365", "saas", "tenant-specific", "business application"],
        serviceFamily: "Business Applications",
        category: "Business SaaS",
        summary: "D365 continuity statements are usually tenant and workload specific. Review guidance should stay visible for discovery but not act as a default enterprise baseline.",
        guardrail: "Do not generalize business application recovery claims across all D365 implementations.",
        recommendedActions: [
            "Validate product-specific continuity commitments with the service owner.",
            "Capture tenant customizations that affect failover or recovery behavior.",
            "Exclude from default export until the workload scope is explicit."
        ]
    },
    "Azure AI Services": {
        title: "Azure AI Services posture",
        severity: "High",
        maturity: "Preview",
        tags: ["ai services", "service-specific", "regional support", "preview"],
        serviceFamily: "AI / Platform Services",
        category: "AI platform",
        summary: "Azure AI Services continuity remains service-specific and still requires deliberate regional validation. The review surface should surface it, not overstate it.",
        guardrail: "Do not treat Azure AI Services as one uniform continuity surface.",
        recommendedActions: [
            "Identify the exact AI service, model, and region set under review.",
            "Validate feature and quota parity before recording architecture conclusions.",
            "Require explicit export override for any leadership-facing report."
        ]
    }
};
