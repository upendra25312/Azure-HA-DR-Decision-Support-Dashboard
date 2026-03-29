# Azure HA/DR Decision Support Dashboard: Enhancement Implementation Prompt

## Objective

Apply the following expert recommendations to elevate the Azure HA/DR Decision Support Dashboard to Microsoft enterprise standards for reliability, usability, and architectural guidance.

---

## 1. **Integrate Azure Best Practices and Reference Content**

**Relevant Agents/Skills:**
- `azure-architect.agent.md` (Agent): Designs Azure architectures, aligns with Well-Architected and Cloud Adoption Framework.
- `architecture-design` (Skill): Service selection, HLD docs, best practices, and reference links.
- `waf-assessment` (Skill): Well-Architected Framework pillar assessment and recommendations.

**Actionable Steps:**
- [ ] Add contextual links to the Azure Architecture Center and Well-Architected Framework for each service in the dashboard UI and recommendations.
- [ ] For each Azure service, provide a "Learn More" or info icon linking to Microsoft Learn documentation and service reliability guides.
- [ ] Where possible, surface Azure Advisor or Well-Architected checks relevant to the selected scenario (using `azure-architect.agent.md` and `waf-assessment`).
- [ ] In recommendations, reference Well-Architected Framework pillars (Reliability, Security, Cost, Operational Excellence, Performance) and link to official guidance.
- [ ] Use the `architecture-design` skill to ensure service selection and patterns are aligned with Microsoft best practices.

---

## 2. **Enhance Reliability and BCDR Guidance**
- [ ] Dynamically highlight region-specific limitations (e.g., ZRS/GRS availability) based on user selections.
- [ ] For each service, display a checklist for “Tested Runbook” or “DR Drill” readiness.
- [ ] Clearly distinguish between platform-managed and customer-managed DR/HA, using icons or badges.

---

## 3. **Deepen Database Service Recommendations**
- [ ] For database services, display RPO/RTO guarantees and geo-replication caveats in the recommendations.
- [ ] Suggest native backup/restore and failover features for each database type.
- [ ] Add tooltips or info icons explaining database-specific HA/DR patterns.

---

## 4. **Expand Infrastructure and PaaS Coverage**
- [ ] For VM-based solutions, recommend Azure Site Recovery and cross-region load balancing where appropriate.
- [ ] For PaaS services, highlight platform SLAs and auto-failover capabilities.
- [ ] Suggest Azure Policy for compliance and configuration drift detection.

---

## 5. **Improve User Experience and Visualization**
- [ ] Add export/share functionality (PDF, Excel, or link) for architecture review boards.
- [ ] Provide a “What’s New” or “Service Updates” section to reflect Azure platform changes.
- [ ] Use visual indicators (badges, icons) for confidence level, SLA, and required human review.
- [ ] Add a summary diagram or flowchart for selected recommendations.
- [ ] Ensure all tooltips and help icons link to relevant Microsoft Learn or Azure docs.

---

## 6. **Technical and Content Maintenance**
- [ ] Ensure the dashboard is always run via a local web server (not file://) to avoid data loading issues.
- [ ] Add telemetry (opt-in) to understand common usage patterns and improve recommendations.
- [ ] Keep the decision matrix and service catalog up to date with Azure’s rapid service evolution.
- [ ] Regularly review and update links to Microsoft Learn and service documentation.
- [ ] Provide clear error messages if data fails to load or if a service is not covered.

---

## 7. **Accessibility and Compliance**
- [ ] Ensure the dashboard meets accessibility standards (color contrast, keyboard navigation, ARIA labels).
- [ ] Add compliance and security notes where relevant, especially for regulated workloads.

---

## 8. **Continuous Improvement**
- [ ] Integrate with Microsoft Learn Q&A or feedback for user-driven improvements.
- [ ] Allow users to save or print their selected scenario and recommendations.
- [ ] Provide a feedback mechanism for users to suggest new features or report issues.

---

**Instructions:**  
Work through each section, checking off items as they are implemented. For each enhancement, reference Microsoft official documentation and best practices. Document all changes in the project’s changelog and update user documentation as needed.

---

**End of Prompt**
