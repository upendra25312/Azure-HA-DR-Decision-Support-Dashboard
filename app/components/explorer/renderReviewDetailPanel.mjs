import { escapeHtml } from "../../utils.mjs";

export function renderReviewDetailPanel({ item, inWorkspace, maturityConfig, severityConfig }) {
    if (!item) {
        return `
            <aside class="detail-panel" aria-label="Review detail">
                <div class="empty-state">
                    <div>
                        <h3>Select a review item</h3>
                        <p class="section-copy">Inspect guidance, review actions, dependencies, and source references here.</p>
                    </div>
                </div>
            </aside>
        `;
    }

    const publicReferences = item.references || [];
    const checklistCoverage = item.checklistCoverage?.checklistCount
        ? `
            <div class="detail-block">
                <h3>Checklist coverage</h3>
                <p class="section-copy">
                    Aggregated from ${item.checklistCoverage.itemCount || 0} checklist item${item.checklistCoverage.itemCount === 1 ? "" : "s"}
                    across ${item.checklistCoverage.checklistCount} review checklist${item.checklistCoverage.checklistCount === 1 ? "" : "s"}.
                </p>
                <ul class="detail-list">
                    ${item.checklistCoverage.checklistNames.slice(0, 4).map((name) => `<li>${escapeHtml(name)}</li>`).join("")}
                </ul>
            </div>
        `
        : "";
    const sourceLinks = publicReferences.map((reference) => `
        <li>
            <a class="inline-link" href="${escapeHtml(reference.url)}" target="_blank" rel="noreferrer">${escapeHtml(reference.label)}</a>
            <span class="meta-copy"> · ${escapeHtml(reference.updated || "Current")}</span>
        </li>
    `).join("");

    return `
        <aside class="detail-panel" aria-label="Review detail">
            <div>
                <div class="pill-row">
                    <span class="chip ${maturityConfig[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                    <span class="chip ${severityConfig[item.severity].tone}">${escapeHtml(item.severity)}</span>
                    <span class="chip governed">${item.exportEligible ? "Default export" : "Override required"}</span>
                </div>
                <h2 class="detail-title">${escapeHtml(item.serviceName)}</h2>
                <p class="section-copy">${escapeHtml(item.summary)}</p>
                <div class="hero-actions">
                    <button
                        class="${inWorkspace ? "button-secondary" : "button"}"
                        data-action="${inWorkspace ? "remove-from-workspace" : "add-to-workspace"}"
                        data-item-id="${escapeHtml(item.id)}"
                    >
                        ${inWorkspace ? "Remove from workspace" : "Add to workspace"}
                    </button>
                    <button class="button-quiet" data-route="/workspace">Open workspace</button>
                </div>
            </div>

            <div class="warning-callout">${escapeHtml(maturityConfig[item.maturity].warning)}</div>

            <div class="detail-block">
                <h3>Review guardrail</h3>
                <p class="section-copy">${escapeHtml(item.guardrail)}</p>
            </div>

            <div class="detail-block">
                <h3>Review actions</h3>
                <ul class="detail-list">
                    ${item.recommendedActions.map((action) => `<li>${escapeHtml(action)}</li>`).join("")}
                </ul>
            </div>

            <div class="detail-block">
                <h3>Why this matters</h3>
                <ul class="detail-list">
                    ${item.detail.limitations.length
            ? item.detail.limitations.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")
            : "<li>No supporting rationale was captured for this item.</li>"}
                </ul>
            </div>

            <div class="detail-block">
                <h3>Dependencies</h3>
                <ul class="detail-list">
                    ${item.detail.dependencies.length
            ? item.detail.dependencies.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")
            : "<li>No dependency list was captured for this item.</li>"}
                </ul>
            </div>

            <div class="detail-block">
                <h3>Test guidance</h3>
                <ul class="detail-list">
                    ${item.detail.testGuidance.length
            ? item.detail.testGuidance.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")
            : "<li>No test guidance was captured for this item.</li>"}
                </ul>
            </div>

            ${checklistCoverage}

            <div class="detail-block">
                <h3>Source references</h3>
                <ul class="detail-list">
                    ${sourceLinks || "<li>Public source link withheld for this item.</li>"}
                </ul>
            </div>

            <div class="detail-block">
                <h3>Local note</h3>
                <p class="meta-copy">Stored in this browser only. Add this item to Workspace if you want the note included in your export.</p>
                <textarea
                    class="textarea"
                    data-note-id="${escapeHtml(item.id)}"
                    placeholder="Capture a local note or follow-up question."
                >${escapeHtml(item.localNote)}</textarea>
            </div>
        </aside>
    `;
}
