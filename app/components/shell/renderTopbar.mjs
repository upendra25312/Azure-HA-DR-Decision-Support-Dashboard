import { escapeHtml } from "../../utils.mjs";

export function renderTopbar({ brandEyebrow, brandName, navItems, activePath }) {
    const navLinks = navItems.map((entry) => [
        "<button",
        `class=\"nav-link ${activePath === entry.path ? "is-active" : ""}\"`,
        `data-route=\"${escapeHtml(entry.path)}\"`,
        ">",
        escapeHtml(entry.title),
        "</button>"
    ].join(" ")).join("");

    return `
        <header class="topbar">
            <div class="brand">
                <div class="brand-mark" aria-hidden="true">AR</div>
                <div>
                    <span class="brand-kicker">${escapeHtml(brandEyebrow)}</span>
                    <span class="brand-name">${escapeHtml(brandName)}</span>
                </div>
            </div>
            <nav class="topbar-nav" aria-label="Primary">
                ${navLinks}
            </nav>
        </header>
    `;
}
