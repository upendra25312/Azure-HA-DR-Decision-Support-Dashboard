# Executive Summary

## Delivery Status

- First-pass researched services completed: 15
- Additional services still planned for future passes: 23
- Current output is decision-useful for the covered services, but not yet exhaustive across the full scope list.

## Current Findings

- Zone redundancy is frequently the right HA answer, but it is not the same as regional DR.
- Cross-region patterns are where true DR begins for the services reviewed so far.
- PaaS services reduce failover operations inside a region, but multi-region responsibility often still sits with the customer.
- Messaging and database services need special attention to replication semantics because metadata replication is not the same as data protection.

## Most Common Mistakes

- Calling multi-AZ or zone redundancy a DR strategy.
- Assuming a service with built-in HA also has built-in regional failover.
- Ignoring runbook, routing, identity, and dependency replication requirements.

## Enterprise Direction

- Standardize on explicit HA versus DR classification per service.
- Use source-backed service patterns instead of generic platform assumptions.
- Validate each target architecture with a failover drill before calling it production ready.

- Multi-region networking services like Virtual WAN provide DR only when you deliberately deploy and test multiple regional hubs.
- SaaS platforms like Fabric and D365 need experience-specific or app-specific DR statements; broad platform claims are risky.
- Azure AI resiliency guidance remains service-specific, so enterprise standards should require explicit per-service regional validation.

- Container and serverless platforms need dependency-aware DR design; managed control planes do not remove the need for multi-region architecture.
- Key Vault has unusually strong built-in resilience, but best-effort paired-region failover still does not equal a guaranteed low-RTO DR design.
- Azure OpenAI continuity depends heavily on duplicate regional deployments, gateway logic, and quota parity.
