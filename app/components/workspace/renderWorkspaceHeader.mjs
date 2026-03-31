import { escapeHtml } from "../../utils.mjs";

export function renderWorkspaceHeader({ eyebrow, title, body, helper }) {
    return `
        <section class="page-hero">
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h1 class="hero-title hero-title--compact">${escapeHtml(title)}</h1>
            <p class="hero-copy">${escapeHtml(body)}</p>
            <p class="meta-copy">${escapeHtml(helper)}</p>
        </section>
    `;
}
