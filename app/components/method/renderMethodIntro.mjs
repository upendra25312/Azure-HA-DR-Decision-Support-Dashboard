import { escapeHtml } from "../../utils.mjs";

export function renderMethodIntro({ eyebrow, title, body }) {
    return `
        <section class="page-hero">
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h1 class="hero-title hero-title--compact">${escapeHtml(title)}</h1>
            <p class="hero-copy">${escapeHtml(body)}</p>
        </section>
    `;
}
