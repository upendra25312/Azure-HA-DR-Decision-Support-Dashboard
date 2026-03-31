import { escapeHtml } from "../../utils.mjs";

export function renderWorkspaceStepStrip({ steps }) {
    return `
        <section class="panel">
            <div class="step-strip">
                ${steps.map((step, index) => `
                    <div class="step-card">
                        <span class="chip public">${index + 1}</span>
                        <strong>${escapeHtml(step)}</strong>
                    </div>
                `).join("")}
            </div>
        </section>
    `;
}
