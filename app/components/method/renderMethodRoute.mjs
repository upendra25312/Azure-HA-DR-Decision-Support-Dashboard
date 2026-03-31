import { renderBoundaryCards } from "./renderBoundaryCards.mjs";
import { renderMethodIntro } from "./renderMethodIntro.mjs";
import { renderMethodRulesGrid } from "./renderMethodRulesGrid.mjs";

export function renderMethodRoute({ copy }) {
    return `
        <main id="main" class="page">
            ${renderMethodIntro(copy.intro)}
            ${renderMethodRulesGrid({ sections: copy.sections })}
            ${renderBoundaryCards({
                supported: copy.supported,
                localOnly: copy.localOnly,
                notSupported: copy.notSupported
            })}
        </main>
    `;
}
