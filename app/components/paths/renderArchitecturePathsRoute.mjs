import { escapeHtml } from "../../utils.mjs";
import { renderPathCardGrid } from "./renderPathCardGrid.mjs";
import { renderPathDetailPanel } from "./renderPathDetailPanel.mjs";

export function renderArchitecturePathsRoute({ paths, selectedPath }) {
    return `
        <main id="main" class="page">
            <section class="page-hero">
                <p class="eyebrow">Architecture Paths</p>
                <h1 class="hero-title hero-title--compact">Start with the architecture problem.</h1>
                <p class="hero-copy">Choose a path that matches the review objective, then move into the catalog with guided filters.</p>
            </section>
            ${renderPathCardGrid({
                paths,
                selectedPathId: selectedPath?.id || ""
            })}
            ${renderPathDetailPanel({ path: selectedPath })}
            <section class="panel">
                <div class="section-header">
                    <div>
                        <p class="eyebrow">Service-first navigation</p>
                        <h2 class="section-title">Prefer to start from a service?</h2>
                        <p class="section-copy">Open the full review catalog and filter directly by service, family, maturity, or severity.</p>
                    </div>
                    <button class="button-secondary" data-route="/explorer">Open Explorer</button>
                </div>
            </section>
        </main>
    `;
}
