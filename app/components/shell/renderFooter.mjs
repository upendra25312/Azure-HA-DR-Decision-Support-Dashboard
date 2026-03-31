import { escapeHtml } from "../../utils.mjs";

export function renderFooter({ boundaryText, links }) {
    const actions = links.map((entry) => `
        <button class="button-quiet" data-route="${escapeHtml(entry.path)}">${escapeHtml(entry.title)}</button>
    `).join("");

    return `
        <footer class="footer">
            <p class="footer-note">${escapeHtml(boundaryText)}</p>
            <div class="footer-links">
                ${actions}
            </div>
        </footer>
    `;
}
