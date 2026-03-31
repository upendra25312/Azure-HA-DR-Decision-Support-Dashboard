import { escapeHtml } from "../../utils.mjs";

export function renderPathCard({ path, selected }) {
    return `
        <article class="path-card ${selected ? "is-selected" : ""}">
            <p class="eyebrow">${escapeHtml(path.presetLabel)}</p>
            <h3>${escapeHtml(path.title)}</h3>
            <p class="section-copy">${escapeHtml(path.summary)}</p>
            <button class="button-quiet" data-route="/paths?path=${encodeURIComponent(path.id)}">View path</button>
        </article>
    `;
}
