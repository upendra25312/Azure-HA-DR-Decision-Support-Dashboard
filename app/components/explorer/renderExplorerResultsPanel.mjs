import { renderReviewListItem } from "./renderReviewListItem.mjs";

export function renderExplorerResultsPanel({ items, selectedItemId, inWorkspace, maturityConfig, severityConfig }) {
    return `
        <section class="panel">
            <div class="section-header">
                <div>
                    <p class="eyebrow">Review items</p>
                    <h2 class="section-title">${items.length ? `${items.length} items in view` : "No items match the current filters"}</h2>
                    <p class="section-copy">${items.length
            ? "Select an item to inspect guidance, dependencies, test guidance, and source references."
            : "Clear one or more filters to expand the catalog."}</p>
                </div>
            </div>
            ${items.length ? `
                <div class="review-list">
                    ${items.map((item) => renderReviewListItem({
                        item,
                        selected: selectedItemId === item.id,
                        inWorkspace: inWorkspace(item.id),
                        maturityConfig,
                        severityConfig
                    })).join("")}
                </div>
            ` : `
                <div class="empty-state">
                    <div>
                        <h3>No items match the current filters</h3>
                        <p class="section-copy">Remove a service, family, or maturity filter to expand the catalog.</p>
                    </div>
                </div>
            `}
        </section>
    `;
}
