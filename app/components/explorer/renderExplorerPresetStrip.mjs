import { escapeHtml } from "../../utils.mjs";

export function renderExplorerPresetStrip({ presets }) {
    return `
        <section class="panel">
            <div class="preset-strip">
                ${presets.map((preset) => `
                    <button class="button-secondary" data-route="${escapeHtml(preset.route)}">${escapeHtml(preset.label)}</button>
                `).join("")}
            </div>
        </section>
    `;
}
