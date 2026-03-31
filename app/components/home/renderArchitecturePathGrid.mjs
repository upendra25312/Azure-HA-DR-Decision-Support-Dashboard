import { escapeHtml } from "../../utils.mjs";

export function renderArchitecturePathGrid({ eyebrow, title, body, paths }) {
    return `
        <section class="section">
            <div class="section-header">
                <div>
                    <p class="eyebrow">${escapeHtml(eyebrow)}</p>
                    <h2 class="section-title">${escapeHtml(title)}</h2>
                    <p class="section-copy">${escapeHtml(body)}</p>
                </div>
            </div>
            <div class="path-grid">
                ${paths.map((path) => `
                    <article class="path-card">
                        <p class="eyebrow">${escapeHtml(path.presetLabel)}</p>
                        <h3>${escapeHtml(path.title)}</h3>
                        <p class="section-copy">${escapeHtml(path.summary)}</p>
                        <button class="button-quiet" data-route="/paths?path=${encodeURIComponent(path.id)}">Open path</button>
                    </article>
                `).join("")}
            </div>
        </section>
    `;
}
