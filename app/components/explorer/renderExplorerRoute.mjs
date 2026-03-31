import { renderExplorerFilterRail } from "./renderExplorerFilterRail.mjs";
import { renderExplorerHeader } from "./renderExplorerHeader.mjs";
import { renderExplorerPresetStrip } from "./renderExplorerPresetStrip.mjs";
import { renderExplorerResultsPanel } from "./renderExplorerResultsPanel.mjs";
import { renderExplorerSummaryBand } from "./renderExplorerSummaryBand.mjs";
import { renderExportDrawer } from "./renderExportDrawer.mjs";
import { renderReviewDetailPanel } from "./renderReviewDetailPanel.mjs";

export function renderExplorerRoute(props) {
    return `
        <main id="main" class="page">
            ${renderExplorerHeader(props.header)}
            ${renderExplorerPresetStrip({ presets: props.presets })}
            ${renderExplorerSummaryBand(props.summary)}
            ${renderExportDrawer({
                isOpen: props.exportPanelOpen,
                options: props.exportOptions,
                warningText: props.exportWarning
            })}
            <section class="detail-grid">
                ${renderExplorerFilterRail({
                    filters: props.filters,
                    families: props.families,
                    services: props.services,
                    categories: props.categories,
                    maturityConfig: props.maturityConfig,
                    severityConfig: props.severityConfig
                })}
                ${renderExplorerResultsPanel({
                    items: props.items,
                    selectedItemId: props.selectedItem?.id || "",
                    inWorkspace: props.inWorkspace,
                    maturityConfig: props.maturityConfig,
                    severityConfig: props.severityConfig
                })}
                ${renderReviewDetailPanel({
                    item: props.selectedItem,
                    inWorkspace: props.selectedItem ? props.inWorkspace(props.selectedItem.id) : false,
                    maturityConfig: props.maturityConfig,
                    severityConfig: props.severityConfig
                })}
            </section>
        </main>
    `;
}
