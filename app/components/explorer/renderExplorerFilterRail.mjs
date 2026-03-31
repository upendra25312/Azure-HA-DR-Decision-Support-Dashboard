import { escapeHtml } from "../../utils.mjs";

function renderSelectOptions(placeholder, values, selected) {
    const options = [`<option value="">${escapeHtml(placeholder)}</option>`];

    values.forEach((value) => {
        options.push(`<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`);
    });

    return options.join("");
}

function renderCheckboxGroup(name, values, selectedValues, configMap) {
    return values.map((value) => `
        <label class="filter-chip-row">
            <input
                type="checkbox"
                name="${escapeHtml(name)}"
                value="${escapeHtml(value)}"
                ${selectedValues.includes(value) ? "checked" : ""}
            >
            <span class="chip ${configMap[value].tone}">${escapeHtml(value)}</span>
        </label>
    `).join("");
}

export function renderExplorerFilterRail({
    filters,
    families,
    services,
    categories,
    maturityConfig,
    severityConfig
}) {
    return `
        <aside class="panel filter-panel" aria-label="Explorer filters">
            <div class="filter-group">
                <label for="search">Search</label>
                <input id="search" class="input" type="search" name="q" value="${escapeHtml(filters.q)}" placeholder="Search service, family, category, or keyword">
            </div>
            <div class="filter-group">
                <label for="serviceFamily">Service family</label>
                <select id="serviceFamily" class="select" name="family">
                    ${renderSelectOptions("All families", families, filters.family)}
                </select>
            </div>
            <div class="filter-group">
                <label for="serviceName">Service</label>
                <select id="serviceName" class="select" name="service">
                    ${renderSelectOptions("All services", services, filters.service)}
                </select>
            </div>
            <div class="filter-group">
                <label for="category">Category</label>
                <select id="category" class="select" name="category">
                    ${renderSelectOptions("All categories", categories, filters.category)}
                </select>
            </div>
            <div class="filter-group">
                <span class="field-label">Maturity</span>
                ${renderCheckboxGroup("maturity", Object.keys(maturityConfig), filters.maturity, maturityConfig)}
            </div>
            <div class="filter-group">
                <span class="field-label">Severity</span>
                ${renderCheckboxGroup("severity", Object.keys(severityConfig), filters.severity, severityConfig)}
            </div>
            <button class="button-quiet" data-action="reset-filters">Reset filters</button>
        </aside>
    `;
}
