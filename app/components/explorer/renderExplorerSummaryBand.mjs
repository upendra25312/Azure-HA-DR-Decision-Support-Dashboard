import { escapeHtml } from "../../utils.mjs";

export function renderExplorerSummaryBand({ total, highSeverity, previewCount, defaultExportEligible }) {
    return `
        <section class="summary-band">
            <article class="stat-card">
                <span class="stat-label">Items in view</span>
                <span class="stat-value">${escapeHtml(String(total))}</span>
                <p class="stat-note">Filtered items currently visible in the catalog.</p>
            </article>
            <article class="stat-card">
                <span class="stat-label">High severity</span>
                <span class="stat-value">${escapeHtml(String(highSeverity))}</span>
                <p class="stat-note">Items that may need earlier review attention.</p>
            </article>
            <article class="stat-card">
                <span class="stat-label">Preview items</span>
                <span class="stat-value">${escapeHtml(String(previewCount))}</span>
                <p class="stat-note">Visible for review, excluded from default export.</p>
            </article>
            <article class="stat-card">
                <span class="stat-label">Export eligible</span>
                <span class="stat-value">${escapeHtml(String(defaultExportEligible))}</span>
                <p class="stat-note">Included by default with current export settings.</p>
            </article>
        </section>
    `;
}
