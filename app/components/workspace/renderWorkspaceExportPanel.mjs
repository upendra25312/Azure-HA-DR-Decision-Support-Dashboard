import { escapeHtml } from "../../utils.mjs";

export function renderWorkspaceExportPanel({ exportOptions, hasItems, helper }) {
    return `
        <section class="panel workspace-sidebar">
            <div class="section-header">
                <div>
                    <p class="eyebrow">Export Review Pack</p>
                    <h2 class="section-title">Export settings</h2>
                    <p class="section-copy">${escapeHtml(helper)}</p>
                </div>
            </div>
            <div class="export-panel">
                <label class="filter-chip-row">
                    <input type="checkbox" data-export-option="includeAdvisory" ${exportOptions.includeAdvisory ? "checked" : ""}>
                    Include advisory content
                </label>
                <label class="filter-chip-row">
                    <input type="checkbox" data-export-option="includePreview" ${exportOptions.includePreview ? "checked" : ""}>
                    Include preview content
                </label>
                <label class="filter-chip-row">
                    <input type="checkbox" data-export-option="includeNotes" ${exportOptions.includeNotes ? "checked" : ""}>
                    Include local notes
                </label>
                <div class="info-callout">Deprecated content remains excluded by default.</div>
            </div>
            <div class="hero-actions">
                <button class="button" data-action="workspace-export" data-export-format="markdown" ${hasItems ? "" : "disabled"}>Export Markdown</button>
                <button class="button-secondary" data-action="workspace-export" data-export-format="csv" ${hasItems ? "" : "disabled"}>Export CSV</button>
                <button class="button-secondary" data-action="workspace-export" data-export-format="json" ${hasItems ? "" : "disabled"}>Export JSON</button>
                <button class="button-secondary" data-action="import-workspace">Import JSON</button>
                <button class="button-quiet" data-action="clear-workspace">Clear workspace</button>
            </div>
        </section>
    `;
}
