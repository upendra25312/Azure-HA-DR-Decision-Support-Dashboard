import { escapeHtml } from "../../utils.mjs";

export function renderExplorerHeader({ eyebrow, title, body, resultCount }) {
    return `
        <section class="page-hero">
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <div class="section-header">
                <div>
                    <h1 class="hero-title hero-title--compact">${escapeHtml(title)}</h1>
                    <p class="hero-copy">${escapeHtml(body)}</p>
                </div>
                <div class="pill-row">
                    <span class="chip public">Open catalog</span>
                    <span class="chip ga-ready">${escapeHtml(String(resultCount))} in view</span>
                </div>
            </div>
        </section>
    `;
}
