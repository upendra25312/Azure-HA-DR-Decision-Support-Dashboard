import { renderArchitecturePathGrid } from "./renderArchitecturePathGrid.mjs";
import { renderExplorerPreviewSection } from "./renderExplorerPreviewSection.mjs";
import { renderHeroSection } from "./renderHeroSection.mjs";
import { renderMethodStrip } from "./renderMethodStrip.mjs";
import { renderTrustStrip } from "./renderTrustStrip.mjs";

export function renderHomeRoute({ copy, paths, metrics }) {
    return `
        <main id="main" class="page">
            ${renderHeroSection(copy.hero)}
            ${renderTrustStrip({ cards: copy.trustStrip.cards })}
            ${renderArchitecturePathGrid({
                eyebrow: copy.pathsSection.eyebrow,
                title: copy.pathsSection.title,
                body: copy.pathsSection.body,
                paths
            })}
            ${renderExplorerPreviewSection({
                eyebrow: copy.explorerPreview.eyebrow,
                title: copy.explorerPreview.title,
                body: copy.explorerPreview.body,
                cta: copy.explorerPreview.cta,
                metrics
            })}
            ${renderMethodStrip(copy.methodStrip)}
        </main>
    `;
}
