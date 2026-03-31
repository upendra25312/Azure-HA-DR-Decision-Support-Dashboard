import { escapeHtml } from "../../utils.mjs";

export function renderHeroSection({ eyebrow, title, body, primaryCta, secondaryCta }) {
    return `
        <section class="page-hero">
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <div class="hero-grid hero-grid--single">
                <div class="kpi-stack">
                    <h1 class="hero-title hero-title--wide">${escapeHtml(title)}</h1>
                    <p class="hero-copy">${escapeHtml(body)}</p>
                    <div class="hero-actions">
                        <button class="button" data-route="${escapeHtml(primaryCta.route)}">${escapeHtml(primaryCta.label)}</button>
                        <button class="button-secondary" data-route="${escapeHtml(secondaryCta.route)}">${escapeHtml(secondaryCta.label)}</button>
                    </div>
                </div>
            </div>
        </section>
    `;
}
