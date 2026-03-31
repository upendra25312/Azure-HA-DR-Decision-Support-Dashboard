import { escapeHtml } from "../../utils.mjs";
import { MATURITY_CONFIG, SEVERITY_CONFIG } from "../../data/reviewMeta.mjs";

function renderWorkspaceItem(item) {
    return `
        <article class="workspace-item-card">
            <div>
                <div class="pill-row">
                    <span class="chip ${MATURITY_CONFIG[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                    <span class="chip ${SEVERITY_CONFIG[item.severity].tone}">${escapeHtml(item.severity)}</span>
                    <span class="chip public">${escapeHtml(item.serviceFamily)}</span>
                </div>
                <h3>${escapeHtml(item.serviceName)}</h3>
                <p class="section-copy">${escapeHtml(item.summary)}</p>
            </div>
            <div class="hero-actions">
                <button class="button-quiet" data-route="/explorer?service=${encodeURIComponent(item.serviceName)}&item=${encodeURIComponent(item.id)}">Open in Explorer</button>
                <button class="button-secondary" data-action="remove-from-workspace" data-item-id="${escapeHtml(item.id)}">Remove</button>
            </div>
        </article>
    `;
}

export function renderWorkspaceItemsPanel({ items, emptyTitle, emptyBody }) {
    return `
        <section class="panel">
            <div class="section-header">
                <div>
                    <p class="eyebrow">Selected items</p>
                    <h2 class="section-title">${items.length ? "Current review pack" : escapeHtml(emptyTitle)}</h2>
                    <p class="section-copy">${items.length ? "Use Explorer to add or remove services as you shape the review pack." : escapeHtml(emptyBody)}</p>
                </div>
            </div>
            ${items.length ? `
                <div class="workspace-item-list">
                    ${items.map((item) => renderWorkspaceItem(item)).join("")}
                </div>
            ` : `
                <div class="empty-state">
                    <div>
                        <h3>${escapeHtml(emptyTitle)}</h3>
                        <p class="section-copy">${escapeHtml(emptyBody)}</p>
                        <button class="button" data-route="/explorer">Open Explorer</button>
                    </div>
                </div>
            `}
        </section>
    `;
}
