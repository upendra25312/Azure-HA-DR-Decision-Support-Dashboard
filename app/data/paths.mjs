export const ARCHITECTURE_PATHS = [
    {
        id: "business-critical-applications",
        type: "reference",
        presetLabel: "Critical applications",
        title: "Business-critical applications",
        summary: "Review app availability targets, dependency resilience, failover patterns, and operational recovery.",
        whyItMatters: "Critical application reviews fail when teams focus on one service at a time and miss the dependency chain that actually decides whether failover works.",
        reviewQuestions: [
            "What are the workload RTO and RPO targets?",
            "Which platform dependencies must recover with the application?",
            "Is the ingress path resilient across regions?",
            "Are application state and configuration dependencies replicated deliberately?",
            "Have regional failover and failback drills been run against the full stack?"
        ],
        serviceNames: [
            "Azure App Service",
            "Azure Front Door",
            "API Management",
            "Azure Functions",
            "Azure Kubernetes Service (AKS)",
            "Azure Key Vault"
        ],
        failurePoints: [
            "Single-region ingress or certificate dependency",
            "App-tier duplication without replicated data dependencies",
            "Unverified client failover behavior",
            "Runbooks that stop at platform failover and miss application recovery"
        ],
        explorerFilters: {
            family: "Compute",
            severity: ["High", "Medium"]
        }
    },
    {
        id: "data-durability-and-recovery",
        type: "pattern",
        presetLabel: "Data durability",
        title: "Data durability and recovery",
        summary: "Review backup, replication, restore testing, recovery point objectives, and data platform dependencies.",
        whyItMatters: "Regional resilience claims often break on data recovery posture, restore timelines, or replication assumptions that were never validated.",
        reviewQuestions: [
            "What data loss is acceptable for the workload?",
            "Which restore paths have been tested recently?",
            "Does redundancy match the required recovery objective?",
            "What replication lag or consistency trade-offs must be disclosed?",
            "Which application dependencies must recover with the data tier?"
        ],
        serviceNames: [
            "Azure SQL Database",
            "Azure Cosmos DB",
            "Azure Storage Account",
            "Azure Backup",
            "Azure Database for PostgreSQL",
            "Azure Databricks"
        ],
        failurePoints: [
            "Treating local or zonal redundancy as cross-region recovery",
            "Restore processes that were never timed end to end",
            "Undisclosed replication lag",
            "Database recovery that does not restore application connectivity"
        ],
        explorerFilters: {
            family: "Databases",
            severity: ["High", "Medium"]
        }
    },
    {
        id: "network-and-edge-resilience",
        type: "security",
        presetLabel: "Network resilience",
        title: "Network and edge resilience",
        summary: "Review ingress, routing, DNS, segmentation, DDoS posture, and regional failover dependencies.",
        whyItMatters: "Many recovery patterns fail because the network and edge architecture was assumed to be resilient without proving alternate routing, origin health, or dependency parity.",
        reviewQuestions: [
            "What controls fail traffic between healthy regions?",
            "Is DNS or global routing part of the recovery design?",
            "Are ingress policies and certificates consistent across regions?",
            "What network dependencies become single points of failure during failover?",
            "How is failback controlled after a regional event?"
        ],
        serviceNames: [
            "Azure Front Door",
            "Azure Application Gateway",
            "Azure DNS",
            "Azure Firewall",
            "Azure VPN Gateway",
            "Azure Virtual WAN"
        ],
        failurePoints: [
            "One active origin behind a global entry point",
            "Regional network controls without secondary-region parity",
            "DNS and certificate dependencies outside the recovery plan",
            "Backend recovery plans that ignore ingress and routing layers"
        ],
        explorerFilters: {
            family: "Identity, Security, and Platform Dependencies",
            severity: ["High", "Medium"]
        }
    },
    {
        id: "platform-foundations",
        type: "platform",
        presetLabel: "Platform foundations",
        title: "Platform foundations",
        summary: "Review landing zone readiness, identity dependencies, platform services, and operational control gaps.",
        whyItMatters: "Platform reviews should expose the shared services and operational dependencies that govern whether application recovery can actually happen under stress.",
        reviewQuestions: [
            "Which shared platform services are common dependencies across workloads?",
            "Which identity and secrets paths are required during recovery?",
            "Are observability, policy, and operational controls available in both regions?",
            "Which platform assumptions would block a regional recovery event?",
            "Where is the platform baseline still advisory rather than proven?"
        ],
        serviceNames: [
            "Microsoft Entra ID",
            "Azure Key Vault",
            "Azure Monitor",
            "Azure Policy",
            "Azure Service Health",
            "Azure Resource Manager"
        ],
        failurePoints: [
            "Shared services that are treated as always available",
            "Recovery runbooks without platform control-plane assumptions documented",
            "Regional failover without identity or secrets dependency review",
            "Operational gaps between landing zone intent and live configuration"
        ],
        explorerFilters: {
            family: "Identity, Security, and Platform Dependencies",
            maturity: ["GA-ready", "Advisory"]
        }
    }
];
