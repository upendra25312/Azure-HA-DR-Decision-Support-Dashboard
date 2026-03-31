import { escapeHtml } from "../../utils.mjs";

export function renderWorkspaceNotesPanel({ workspaceName, globalNotes }) {
    return `
        <section class="panel workspace-sidebar">
            <div class="filter-group">
                <label for="workspaceName">Workspace name</label>
                <input
                    id="workspaceName"
                    class="input"
                    type="text"
                    data-workspace-field="name"
                    value="${escapeHtml(workspaceName)}"
                    placeholder="My review pack"
                >
            </div>
            <div class="filter-group">
                <label for="workspaceNotes">Executive summary</label>
                <textarea
                    id="workspaceNotes"
                    class="textarea"
                    data-workspace-field="globalNotes"
                    placeholder="Capture the overall scope, assumptions, or leadership context for this review pack."
                >${escapeHtml(globalNotes)}</textarea>
            </div>
        </section>
    `;
}
