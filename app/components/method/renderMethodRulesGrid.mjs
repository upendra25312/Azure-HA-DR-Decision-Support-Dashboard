import { escapeHtml } from "../../utils.mjs";

export function renderMethodRulesGrid({ sections }) {
    return `
        <section class="method-grid">
            ${sections.map((section) => `
                <article class="method-card">
                    <p class="eyebrow">${escapeHtml(section.eyebrow)}</p>
                    <h2 class="section-title">${escapeHtml(section.title)}</h2>
                    <p class="section-copy">${escapeHtml(section.body)}</p>
                </article>
            `).join("")}
        </section>
    `;
}
