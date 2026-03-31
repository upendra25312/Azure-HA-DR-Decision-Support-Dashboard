import { renderWorkspaceExportPanel } from "./renderWorkspaceExportPanel.mjs";
import { renderWorkspaceHeader } from "./renderWorkspaceHeader.mjs";
import { renderWorkspaceItemsPanel } from "./renderWorkspaceItemsPanel.mjs";
import { renderWorkspaceNoteGrid } from "./renderWorkspaceNoteGrid.mjs";
import { renderWorkspaceNotesPanel } from "./renderWorkspaceNotesPanel.mjs";
import { renderWorkspaceStepStrip } from "./renderWorkspaceStepStrip.mjs";
import { renderWorkspaceSummaryBand } from "./renderWorkspaceSummaryBand.mjs";

export function renderWorkspaceRoute({ copy, workspace, items, summary, exportOptions }) {
    return `
        <main id="main" class="page">
            ${renderWorkspaceHeader({
                eyebrow: copy.header.eyebrow,
                title: copy.header.title,
                body: copy.header.body,
                helper: copy.helper
            })}
            ${renderWorkspaceStepStrip({ steps: copy.steps })}
            ${renderWorkspaceSummaryBand({
                summary,
                visible: items.length > 0
            })}
            <section class="workspace-shell">
                ${renderWorkspaceItemsPanel({
                    items,
                    emptyTitle: copy.emptyItemsTitle,
                    emptyBody: copy.emptyItemsBody
                })}
                <div class="workspace-grid">
                    ${renderWorkspaceNotesPanel({
                        workspaceName: workspace.name,
                        globalNotes: workspace.globalNotes
                    })}
                    ${renderWorkspaceExportPanel({
                        exportOptions,
                        hasItems: items.length > 0,
                        helper: copy.exportHelper
                    })}
                </div>
            </section>
            ${renderWorkspaceNoteGrid({
                items,
                emptyTitle: copy.emptyNotesTitle,
                emptyBody: copy.emptyNotesBody
            })}
            <input hidden type="file" accept="application/json" data-workspace-import>
        </main>
    `;
}
