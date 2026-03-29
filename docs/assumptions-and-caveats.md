# Assumptions and Caveats

## Research Rules

- Use current official Microsoft sources only unless a documented gap requires otherwise.
- Prefer Microsoft Learn, Azure Architecture Center, Azure reliability documentation, Well-Architected guidance, and official product documentation.
- Do not generalize one service's behavior to another.
- Do not invent exact RTO or RPO values when Microsoft does not guarantee them.

## Interpretation Rules

- Same-region zone designs are treated as HA and zonal resiliency by default.
- Cross-region replication and failover are treated as DR and regional resiliency by default.
- Inferred patterns must be labeled clearly when no direct Microsoft reference architecture exists.

## Remaining Work

- Populate source-backed service findings.
- Validate region, zone, and SKU constraints before final recommendations.
- Confirm dashboard logic against completed research data.

- Current workbook coverage is partial. Services still marked `Planned` in the service catalog do not yet have first-pass source-backed recommendations in the decision matrix.
