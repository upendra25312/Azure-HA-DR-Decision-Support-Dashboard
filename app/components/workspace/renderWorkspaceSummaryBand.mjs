import { escapeHtml } from "../../utils.mjs";

export function renderWorkspaceSummaryBand({ summary, visible }) {
    if (!visible) {
        return "";
    }

    return `
        <section class="summary-band">
            <article class="stat-card">
                <span class="stat-label">Selected items</span>
                <span class="stat-value">${escapeHtml(String(summary.itemCount))}</span>
                <p class="stat-note">Services currently included in this review pack.</p>
            </article>
            <article class="stat-card">
                <span class="stat-label">Notes captured</span>
                <span class="stat-value">${escapeHtml(String(summary.noteCount))}</span>
                <p class="stat-note">Global notes plus item-level notes with content.</p>
            </article>
            <article class="stat-card">
                <span class="stat-label">Maturity mix</span>
                <span class="stat-value stat-value--compact">${escapeHtml(summary.maturityMix)}</span>
                <p class="stat-note">Visible summary of the selected review posture.</p>
            </article>
            <article class="stat-card">
                <span class="stat-label">Last updated</span>
                <span class="stat-value stat-value--compact">${escapeHtml(summary.lastUpdated)}</span>
                <p class="stat-note">Updated when the shortlist or notes change.</p>
            </article>
        </section>
    `;
}
