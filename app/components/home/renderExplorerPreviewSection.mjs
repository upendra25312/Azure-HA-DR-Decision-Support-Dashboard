import { escapeHtml } from "../../utils.mjs";

export function renderExplorerPreviewSection({ eyebrow, title, body, cta, metrics }) {
    return `
        <section class="section">
            <div class="section-header">
                <div>
                    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
                    <h2 class="section-title">${escapeHtml(title)}</h2>
                    <p class="section-copy">${escapeHtml(body)}</p>
                </div>
                <button class="button" data-route="${escapeHtml(cta.route)}">${escapeHtml(cta.label)}</button>
            </div>
            <div class="summary-band">
                <article class="stat-card">
                    <span class="stat-label">Review items</span>
                    <span class="stat-value">${escapeHtml(String(metrics.totalItems))}</span>
                    <p class="stat-note">Catalog items currently available in the review surface.</p>
                </article>
                <article class="stat-card">
                    <span class="stat-label">High severity</span>
                    <span class="stat-value">${escapeHtml(String(metrics.highSeverity))}</span>
                    <p class="stat-note">Items that deserve early attention in resilience reviews.</p>
                </article>
                <article class="stat-card">
                    <span class="stat-label">GA-ready</span>
                    <span class="stat-value">${escapeHtml(String(metrics.gaReady))}</span>
                    <p class="stat-note">Included by default when a review pack is exported.</p>
                </article>
                <article class="stat-card">
                    <span class="stat-label">Preview watchlist</span>
                    <span class="stat-value">${escapeHtml(String(metrics.preview))}</span>
                    <p class="stat-note">Visible for review, but excluded from default export.</p>
                </article>
            </div>
        </section>
    `;
}
