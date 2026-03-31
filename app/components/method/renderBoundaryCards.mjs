import { escapeHtml } from "../../utils.mjs";

function renderBoundaryCard(title, items) {
    return `
        <article class="governed-card">
            <h3>${escapeHtml(title)}</h3>
            <ul class="copy-list">
                ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
        </article>
    `;
}

export function renderBoundaryCards({ supported, localOnly, notSupported }) {
    return `
        <section class="checklist-grid">
            ${renderBoundaryCard("What works now", supported)}
            ${renderBoundaryCard("What stays local", localOnly)}
            ${renderBoundaryCard("What is not supported", notSupported)}
        </section>
    `;
}
