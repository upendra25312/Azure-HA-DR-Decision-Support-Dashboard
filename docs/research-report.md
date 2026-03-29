# Research Report

## Purpose

This first research pass covers fifteen Azure services and platforms and establishes source-backed HA versus DR guidance using current Microsoft documentation reviewed through 2026-03-27.

## Coverage Status

- First-pass researched services: 15
- Remaining planned services in catalog: 23
- Current workbook is useful for early architecture decisions, but it is not yet a complete service-wide Azure HA/DR catalog.

## Compute

### Azure Virtual Machines

- Availability zones improve in-region resiliency, but VM recovery and traffic rerouting remain customer responsibilities.
- VMs are single-region resources, so regional DR requires another region plus Site Recovery or a custom pattern.

### Azure App Service

- Zone redundancy is strong in-region HA for supported Premium plans, but App Service is still a single-region service.
- Regional DR requires duplicate deployment in another region plus traffic routing and replicated dependencies.

## Databases

### Azure SQL Database

- Zone redundancy is HA, not regional DR.
- Regional DR starts with failover groups, active geo-replication, or geo-restore depending target RTO/RPO and operational model.

### Azure Cosmos DB

- Recommendations must be topology-specific. Single-region, single-write multi-region, and multi-write accounts behave differently during outages.
- Single-region accounts with zones can survive a zone outage, but not a full regional outage.

## Storage and Messaging

### Azure Storage Account

- Same-region redundancy choices define HA. Geo-redundant choices define DR.
- ZRS is Microsofts recommended primary-region HA option for Data Lake Storage workloads and generally the better HA baseline than LRS.

### Azure Service Bus

- Geo-Replication and metadata Geo-Disaster Recovery are materially different. Metadata Geo-DR should not be presented as message-protecting DR.
- Native multi-region features require Premium tier.

## Cross-Cutting Findings

- Same-region zone redundancy should be labeled HA or zonal resiliency unless Microsoft explicitly frames it as DR.
- Regional DR almost always requires cross-region replication plus a failover mechanism and runbook.
- Several services provide built-in HA but still require customer-managed regional designs.

### Azure Virtual WAN

- Virtual WAN provides strong in-hub HA, but region-level DR only appears when you deploy multiple hubs across regions and deliberately engineer routing failover.
- Treat hub redundancy and regional redundancy as separate design decisions.

### Microsoft Fabric

- Fabric reliability is experience-specific. OneLake-backed scenarios have the clearest DR story, but many experiences degrade to read-only or require customer recovery steps after failover.
- Avoid treating Fabric as a uniform platform with one universal RTO/RPO profile.

### Dynamics 365 (D365)

- D365 production environments have strong in-region resilience, but cross-region DR depends on app support and self-service DR enablement.
- Do not assume that every Dynamics workload supports the same regional failover behavior.

### Azure AI Services

- Microsoft guidance is still mostly service-specific for AI resiliency.
- For AI workloads, the safest pattern is per-service validation of regional parity, then app-level failover across duplicate regional deployments.

### Azure Kubernetes Service (AKS)

- AKS control plane resiliency is not enough by itself; real HA depends on zonal node pools, replicated pods, resilient ingress, and resilient dependencies.
- Regional DR begins only when you add another cluster and orchestrate failover across regions.

### Azure Functions

- Functions reliability is highly dependent on hosting plan and trigger type.
- HTTP-triggered DR is typically active-active behind Front Door, while non-HTTP workloads are usually safer with active-passive regional patterns.

### Azure Key Vault

- Key Vault has strong built-in in-region resilience and paired-region replication, but Microsoft-managed regional failover is best effort and can take hours.
- For stricter DR targets, use separate vaults in multiple regions and application-aware failover.

### Azure OpenAI

- Azure OpenAI regional continuity requires at least two resources in different regions plus duplicated model deployments.
- Gateway-based failover and quota parity are essential if the workload is business critical.
