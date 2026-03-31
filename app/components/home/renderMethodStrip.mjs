import { escapeHtml } from "../../utils.mjs";

export function renderMethodStrip({ eyebrow, title, body, cta }) {
    return `
        <section class="section">
            <article class="panel method-strip">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
                        <h2 class="section-title">${escapeHtml(title)}</h2>
                        <p class="section-copy">${escapeHtml(body)}</p>
                    </div>
                    <button class="button-secondary" data-route="${escapeHtml(cta.route)}">${escapeHtml(cta.label)}</button>
                </div>
            </article>
        </section>
    `;
}
