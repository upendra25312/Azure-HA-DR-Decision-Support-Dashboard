import { escapeHtml, formatDate } from "../../utils.mjs";

export function renderReviewListItem({ item, selected, inWorkspace, maturityConfig, severityConfig }) {
    const isPreview = item.maturity === "Preview";

    return `
        <article
            class="review-card ${selected ? "is-selected" : ""} ${isPreview ? "preview-item" : ""}"
            tabindex="0"
            data-action="select-item"
            data-item-id="${escapeHtml(item.id)}"
        >
            <div class="pill-row">
                <span class="chip ${maturityConfig[item.maturity].tone}">${escapeHtml(item.maturity)}</span>
                <span class="chip ${severityConfig[item.severity].tone}">${escapeHtml(item.severity)}</span>
                <span class="chip public">${escapeHtml(item.serviceFamily)}</span>
            </div>
            <h3>${escapeHtml(item.serviceName)}</h3>
            <p class="section-copy">${escapeHtml(item.summary)}</p>
            <p class="meta-copy">${escapeHtml(item.category)} · Reviewed ${escapeHtml(formatDate(item.lastReviewedDate))}</p>
            <div class="pill-row">
                <span class="chip governed">${item.exportEligible ? "Default export" : "Override required"}</span>
                ${inWorkspace ? '<span class="chip ga-ready">In workspace</span>' : ""}
            </div>
        </article>
    `;
}
