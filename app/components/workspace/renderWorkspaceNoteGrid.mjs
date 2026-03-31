import { escapeHtml } from "../../utils.mjs";
import { MATURITY_CONFIG, SEVERITY_CONFIG } from "../../data/reviewMeta.mjs";

function renderWorkspaceNoteCard(item) {
    return `
        <article class="workspace-note-card">
            <div class="pill-row">
                <span class="chip ${MATURITY_CONFIG[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                <span class="chip ${SEVERITY_CONFIG[item.severity].tone}">${escapeHtml(item.severity)}</span>
            </div>
            <h3>${escapeHtml(item.serviceName)}</h3>
            <textarea
                class="textarea"
                data-note-id="${escapeHtml(item.id)}"
                placeholder="Capture the service-specific note for this review pack."
            >${escapeHtml(item.localNote || "")}</textarea>
        </article>
    `;
}

export function renderWorkspaceNoteGrid({ items, emptyTitle, emptyBody }) {
    return `
        <section class="panel">
            <div class="section-header">
                <div>
                    <p class="eyebrow">Item notes</p>
                    <h2 class="section-title">Service-by-service notes</h2>
                </div>
            </div>
            ${items.length ? `
                <div class="workspace-note-grid">
                    ${items.map((item) => renderWorkspaceNoteCard(item)).join("")}
                </div>
            ` : `
                <div class="empty-state">
                    <div>
                        <h3>${escapeHtml(emptyTitle)}</h3>
                        <p class="section-copy">${escapeHtml(emptyBody)}</p>
                    </div>
                </div>
            `}
        </section>
    `;
}
