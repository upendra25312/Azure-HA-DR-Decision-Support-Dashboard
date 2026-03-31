import { escapeHtml } from "../../utils.mjs";

export function renderPathDetailPanel({ path }) {
    if (!path) {
        return `
            <section class="panel">
                <div class="empty-state">
                    <div>
                        <h3>Select an architecture path</h3>
                        <p class="section-copy">Choose a path to see review questions, related services, and guided Explorer filters.</p>
                    </div>
                </div>
            </section>
        `;
    }

    return `
        <section class="panel">
            <div class="section-header">
                <div>
                    <p class="eyebrow">Selected path</p>
                    <h2 class="section-title">${escapeHtml(path.title)}</h2>
                    <p class="section-copy">${escapeHtml(path.summary)}</p>
                </div>
                <div class="hero-actions">
                    <button class="button" data-route="${escapeHtml(path.explorerRoute)}">Open in Explorer</button>
                    <button class="button-secondary" data-route="/explorer">Open full catalog</button>
                </div>
            </div>
            <div class="method-grid">
                <article class="method-card">
                    <p class="eyebrow">Scope</p>
                    <h3>Where to use this path</h3>
                    <p class="section-copy">${escapeHtml(path.whyItMatters)}</p>
                </article>
                <article class="method-card">
                    <p class="eyebrow">Common services</p>
                    <h3>Typical Azure surfaces</h3>
                    <div class="pill-row">
                        ${path.serviceNames.map((service) => `<span class="chip public">${escapeHtml(service)}</span>`).join("")}
                    </div>
                </article>
            </div>
            <div class="method-grid">
                <article class="method-card">
                    <p class="eyebrow">Primary review questions</p>
                    <ul class="copy-list">
                        ${path.reviewQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
                    </ul>
                </article>
                <article class="method-card">
                    <p class="eyebrow">Typical failure points</p>
                    <ul class="copy-list">
                        ${path.failurePoints.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}
                    </ul>
                </article>
            </div>
        </section>
    `;
}
