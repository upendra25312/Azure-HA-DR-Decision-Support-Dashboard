import { escapeHtml } from "../../utils.mjs";

export function renderExportDrawer({ isOpen, options, warningText }) {
    return `
        <section class="panel">
            <div class="toolbar">
                <div>
                    <h2 class="section-title">Export Review Pack</h2>
                    <p class="section-copy">Download the current filtered review pack as Markdown or CSV. Default export remains GA-ready only unless you deliberately include additional maturity states.</p>
                </div>
                <div class="hero-actions">
                    <button class="button-secondary" data-action="toggle-export">
                        ${isOpen ? "Hide export settings" : "Show export settings"}
                    </button>
                    <button class="button" data-action="download-export" data-export-format="markdown">Download Markdown</button>
                    <button class="button-secondary" data-action="download-export" data-export-format="csv">Download CSV</button>
                </div>
            </div>
            ${isOpen ? `
                <div class="export-panel">
                    <label class="filter-chip-row">
                        <input type="checkbox" data-export-option="includeAdvisory" ${options.includeAdvisory ? "checked" : ""}>
                        Include advisory content
                    </label>
                    <label class="filter-chip-row">
                        <input type="checkbox" data-export-option="includePreview" ${options.includePreview ? "checked" : ""}>
                        Include preview content
                    </label>
                    <label class="filter-chip-row">
                        <input type="checkbox" data-export-option="includeNotes" ${options.includeNotes ? "checked" : ""}>
                        Include local notes
                    </label>
                    <div class="warning-callout">${escapeHtml(warningText)}</div>
                </div>
            ` : ""}
        </section>
    `;
}
