import { escapeHtml } from "../../utils.mjs";

export function renderTrustStrip({ cards }) {
    return `
        <section class="section">
            <div class="trust-strip">
                ${cards.map((card) => `
                    <article class="trust-card">
                        <h2>${escapeHtml(card.title)}</h2>
                        <p class="section-copy">${escapeHtml(card.body)}</p>
                    </article>
                `).join("")}
            </div>
        </section>
    `;
}
