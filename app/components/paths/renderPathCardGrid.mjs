import { renderPathCard } from "./renderPathCard.mjs";

export function renderPathCardGrid({ paths, selectedPathId }) {
    return `
        <section class="path-grid">
            ${paths.map((path) => renderPathCard({
                path,
                selected: path.id === selectedPathId
            })).join("")}
        </section>
    `;
}
