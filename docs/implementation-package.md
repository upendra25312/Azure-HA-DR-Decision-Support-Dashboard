## 1. Executive recommendation

Position the product as `Azure Review Board`.

Publicly, it is a source-traceable Azure architecture review demo for exploration and preparation.

Internally, it becomes a governed workspace only when deployed behind Microsoft Entra ID with protected APIs, persistent records, evidence capture, decision tracking, and audit logging.

Do not market one URL as both a public demo and an enterprise workflow system. Split the message, split the routes, and let the product behavior enforce the split.

## 2. Target product model

### Public Demo

- Purpose: open access, fast service exploration, source traceability, local-only notes, safe sample exports.
- Allowed: browse services, review maturity and severity, inspect sources, keep local browser notes, export sample markdown with maturity mix.
- Not allowed: shared review sessions, fake collaboration, fake approvals, fake persistence, public write access.
- Product promise: "Explore the guidance. Do not confuse this with enterprise review execution."

### Governed Workspace

- Purpose: authenticated internal architecture review execution.
- Required controls: Microsoft Entra ID auth, route protection, role-based access, protected APIs, durable storage, audit-friendly write events.
- Allowed: saved workspaces, evidence links, decision records, exceptions, owners, due dates, governed exports, export history, audit trail.
- Not allowed: public access to review records, hidden maturity composition, anonymous writes, implicit sign-off.

### Product naming and copy

- Product name: `Azure Review Board`
- One-sentence value proposition: `Source-backed Azure architecture review guidance with a clear public demo and a governed workspace path.`
- Hero copy: `Azure architecture review that separates exploration from governance.`
- Primary CTA: `Open Public Explorer`
- Secondary CTA: `See Governed Workspace`
- About / Method summary: `A review accelerator, not a sign-off engine. Microsoft sources first. Maturity changes product behavior.`
- What works now: public explorer, traceable sources, local-only notes, sample export.
- What requires governed mode: saved workspaces, evidence, decisions, export history, audit.
- What is not supported: public shared records, fake approvals, hidden non-GA content in exports.

## 3. Revised sitemap

| Route | Page | Purpose | Primary user | Primary action | Must not appear |
|---|---|---|---|---|---|
| `/` | Home | Establish product model and direct users into the explorer | Executive sponsor, architect, evaluator | Open Public Explorer | Long roadmap detail, mixed-mode caveat walls, fake enterprise controls |
| `/explorer` | Explorer | Public demo core for review-item discovery | Architect, engineer, operator | Filter and inspect review items | Shared workflow claims, governed write actions |
| `/services` | Services | Service-first catalog entry point | Architect, product evaluator | Open one service in explorer | Export workflow, roadmap detail |
| `/method` | Method / About | Explain method, boundaries, and responsible use | Decision maker, reviewer | Understand scope and limits | Generic marketing, hidden caveats |
| `/roadmap` | Roadmap | Show phased path to governed deployment | Sponsor, architect, delivery lead | Review rollout phases | Primary public action, detailed current-state exploration |
| `/workspace` | Review Workspace | Protected internal workspace shell | Reviewer, architect | Sign in / open governed session | Public notes, anonymous access |
| `/reports` | Reports / Exports | Governed export rules and history | Reviewer, architect, leadership operations | Generate or audit governed export | Anonymous export history, hidden maturity composition |
| `/admin` | Admin | Role, source, and policy controls | Admin | Manage policy and access | Non-admin controls, public visibility |

### Page rules

- Home must have one clear main action: `Open Public Explorer`.
- Explorer must be the product core.
- Method must own boundaries and safe use.
- Roadmap must stay outside the main task flow.
- Governed routes must render as protected surfaces, not public teasers.

## 4. Homepage redesign

### Text wireframe

1. Hero
   `Public Demo`
   `Azure architecture review that separates exploration from governance.`
   `Public Demo is open, fast, and source traceable. Governed Workspace is protected, role aware, and designed for evidence, decisions, and audit history.`
   Primary CTA: `Open Public Explorer`
   Secondary CTA: `See Governed Workspace`

2. Short product value statement
   `Source-backed Azure architecture review guidance with a clear public demo and a governed workspace path.`

3. Trust/value cards
   - `One public job`: explore, do not pretend persistence.
   - `Governance by default`: GA-ready export default, overrides required for advisory and preview.
   - `Traceable sources`: Microsoft links and review dates on each item.
   - `Honest boundaries`: no fake approvals or hidden enterprise workflow.

4. Service/family overview
   - Top review families with service counts and high-priority counts.
   - CTA: `View all services`

5. Governance/maturity summary
   - `Default export`: GA-ready only.
   - `Public notes`: browser only.
   - `Governed mode`: sign-in, evidence, decisions, audit.

6. Method/source traceability preview
   - `A review accelerator, not a sign-off engine.`
   - `Microsoft sources first.`
   - `Maturity changes behavior, not just labels.`

7. Footer
   - Public Demo definition
   - Governed Workspace definition
   - Links to Explorer, Method, Roadmap

### Recommended hierarchy

- Hero headline first
- Primary CTA above the fold
- Trust cards immediately after the hero
- Explorer-forward service overview before deeper explanatory content
- Boundary and method copy below primary action areas

### Recommended metrics/cards

- `Source-backed services`
- `GA-ready baseline`
- `Advisory items`
- `Preview watchlist`

## 5. Explorer redesign

### Layout

- Left column: sticky filter rail
- Center column: review-item results list
- Right column: sticky detail panel
- Mobile: filters, results, and detail stack vertically

### Filter model

- Search text
- Service family
- Service
- Category
- Maturity multi-select
- Severity multi-select

### Item card model

- Title
- Service
- Family
- Maturity badge
- Severity badge
- One-sentence summary
- Last reviewed date

### Detail panel model

- Service title and badges
- Summary
- Maturity warning
- Review guardrail
- Recommended actions
- Why this matters
- Dependencies
- Test guidance
- Source traceability links
- Local-only demo note

### Empty state

- Message: `No review items match this filter set.`
- Recovery: `Remove a service or maturity filter, or reset the explorer to the default GA-first posture.`

### Loading state

- Copy: `Loading the public review catalog.`
- Behavior: skeleton/spinner only, no partial render flashes

### Error state

- Copy: `The review data could not be loaded.`
- CTA: `Retry`

### Deep-link behavior

- Query parameters: `q`, `family`, `service`, `category`, `maturity`, `severity`, `item`
- Filter changes update the URL
- Service cards deep-link into explorer with `service` and `item`
- If `item` is missing, first matching result becomes the selected item

### Preview and deprecated treatment

- Preview: amber styling, excluded from default export, warning in detail panel
- Deprecated: red styling, isolated from default result posture, excluded from export by default

## 6. Governance model

### Maturity definitions

| Maturity | Definition | Default export | Warning pattern |
|---|---|---|---|
| `GA-ready` | Review content is sufficiently curated and source-backed for default use in public sample exports | Yes | `Included in sample exports by default.` |
| `Advisory` | Source-backed but materially context-sensitive; requires architecture judgment before leadership reliance | No | `Advisory content is excluded from default export and must be included deliberately.` |
| `Preview` | Partial, still stabilizing, or not broad enough for baseline use | No | `Preview content is visible for discovery, but never included by default.` |
| `Deprecated` | Retained for traceability or retirement planning only | No | `Deprecated content is isolated and excluded from export by default.` |

### Badge and color logic

- `GA-ready`: green
- `Advisory`: neutral slate
- `Preview`: amber
- `Deprecated`: red
- `High severity`: red
- `Medium severity`: amber
- `Low severity`: muted green

### Export logic

- GA-ready: included by default
- Advisory: excluded by default, explicit opt-in required
- Preview: excluded by default, explicit opt-in required
- Deprecated: excluded by default, separate override required if ever enabled in governed mode

### Warning patterns

- Public demo warning: `Public demo exports are sample outputs. They do not create shared review records or audit events.`
- Advisory warning: `This export contains advisory material and should not be treated as a GA-only baseline.`
- Preview warning: `This export contains preview material that was deliberately added.`
- Leadership warning: `Leadership-facing exports must disclose non-GA content in the maturity mix.`

### Decision table

| State | Visible in explorer | Included by default | Needs override | Allowed in governed export | Notes |
|---|---|---|---|---|---|
| GA-ready | Yes | Yes | No | Yes | Default baseline |
| Advisory | Yes | No | Yes | Yes | Mixed-maturity export only |
| Preview | Yes | No | Yes | Yes | Must be disclosed clearly |
| Deprecated | Optional / isolated | No | Yes | Rarely, usually no | Traceability or retirement planning only |

## 7. Data model

### Entity list

- `ReviewItem`
- `ReviewWorkspace`
- `ReviewItemState`
- `Owner`
- `Evidence`
- `DecisionRecord`
- `ExceptionRecord`
- `ExportHistory`
- `AuditEvent`

### TypeScript interfaces

```ts
export interface ReviewItem {
  id: string;
  title: string;
  summary: string;
  serviceFamily: string;
  serviceName: string;
  category: string;
  severity: "High" | "Medium" | "Low";
  maturity: "GA-ready" | "Advisory" | "Preview" | "Deprecated";
  sourceName: string;
  sourceUrl: string;
  sourceVersion: string;
  lastReviewedDate: string;
  tags: string[];
  exportEligible: boolean;
  requiresExplicitOverride: boolean;
  notes: string;
}

export interface ReviewWorkspace {
  id: string;
  title: string;
  mode: "governed";
  status: "Draft" | "InReview" | "Approved" | "Closed";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  maturityMix: Record<string, number>;
}

export interface ReviewItemState {
  workspaceId: string;
  reviewItemId: string;
  status: "Open" | "NeedsEvidence" | "Accepted" | "Rejected" | "Exception";
  ownerId?: string;
  dueDate?: string;
  decisionId?: string;
  localNote?: string;
}

export interface Owner {
  id: string;
  displayName: string;
  email: string;
  role: "Viewer" | "Reviewer" | "Architect" | "Admin";
}

export interface Evidence {
  id: string;
  workspaceId: string;
  reviewItemId: string;
  label: string;
  url?: string;
  blobPath?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface DecisionRecord {
  id: string;
  workspaceId: string;
  reviewItemId: string;
  decision: "Approved" | "ApprovedWithConditions" | "Rejected";
  rationale: string;
  decidedBy: string;
  decidedAt: string;
}

export interface ExceptionRecord {
  id: string;
  workspaceId: string;
  reviewItemId: string;
  reason: string;
  ownerId: string;
  expiresAt?: string;
  approvedBy?: string;
}

export interface ExportHistory {
  id: string;
  workspaceId: string;
  format: "pdf" | "docx" | "markdown" | "json";
  requestedBy: string;
  requestedAt: string;
  includedMaturity: Array<ReviewItem["maturity"]>;
  itemCount: number;
  artifactUrl: string;
}

export interface AuditEvent {
  id: string;
  entityType: "workspace" | "reviewItemState" | "decision" | "export";
  entityId: string;
  action: string;
  actorId: string;
  occurredAt: string;
  payloadHash?: string;
}
```

### Validation rules

- `sourceUrl` must be HTTPS
- `lastReviewedDate` must be ISO date
- `maturity` must be one of the four supported values
- `exportEligible` must equal `true` only for `GA-ready`
- `requiresExplicitOverride` must equal `true` for `Advisory`, `Preview`, and `Deprecated`
- `DecisionRecord` cannot be created without `decidedBy` and `decidedAt`
- `ExportHistory.includedMaturity` must always be stored

### Example payloads

```json
{
  "id": "azure-sql-database",
  "title": "Azure SQL Database continuity posture",
  "summary": "Strong in-region platform HA is available, but regional DR only starts when cross-region features and client failover behavior are designed and tested together.",
  "serviceFamily": "Databases",
  "serviceName": "Azure SQL Database",
  "category": "Database",
  "severity": "High",
  "maturity": "GA-ready",
  "sourceName": "Reliability in Azure SQL Database",
  "sourceUrl": "https://learn.microsoft.com/en-us/azure/reliability/reliability-sql-database",
  "sourceVersion": "2026-01-22",
  "lastReviewedDate": "2026-03-25",
  "tags": ["sql", "zone redundancy", "failover groups"],
  "exportEligible": true,
  "requiresExplicitOverride": false,
  "notes": "Do not describe zone redundancy as regional DR."
}
```

```json
{
  "id": "wrk-2026-001",
  "title": "Global payments platform review",
  "mode": "governed",
  "status": "InReview",
  "ownerId": "u-architect-01",
  "createdAt": "2026-03-29T09:00:00Z",
  "updatedAt": "2026-03-29T10:15:00Z",
  "maturityMix": {
    "GA-ready": 7,
    "Advisory": 3,
    "Preview": 1
  }
}
```

## 8. Security architecture

### Auth model

- Platform: Azure Static Web Apps Standard
- Identity provider: Microsoft Entra ID
- Public routes: anonymous access allowed
- Governed routes: authenticated access required
- Admin routes: admin role required

### Role model

| Role | Read workspace | Update status | Approve decisions | Export governed reports | Manage policy |
|---|---|---|---|---|---|
| Viewer | Yes | No | No | No | No |
| Reviewer | Yes | Yes | No | Yes | No |
| Architect | Yes | Yes | Yes | Yes | No |
| Admin | Yes | Yes | Yes | Yes | Yes |

### Route protection table

| Route | Public | Auth required | Role required |
|---|---|---|---|
| `/` | Yes | No | None |
| `/explorer` | Yes | No | None |
| `/services` | Yes | No | None |
| `/method` | Yes | No | None |
| `/roadmap` | Yes | No | None |
| `/workspace` | No | Yes | `authenticated` minimum |
| `/reports` | No | Yes | `authenticated` minimum |
| `/admin` | No | Yes | `admin` |

### API protection table

| API | Purpose | Allowed roles |
|---|---|---|
| `GET /api/workspaces/{id}` | Load workspace | Viewer, Reviewer, Architect, Admin |
| `POST /api/workspaces` | Create workspace | Reviewer, Architect, Admin |
| `PATCH /api/review-item-states/{id}` | Update review status | Reviewer, Architect, Admin |
| `POST /api/decisions` | Record decision | Architect, Admin |
| `POST /api/exports` | Generate governed export | Reviewer, Architect, Admin |
| `GET /api/audit` | Query audit events | Admin |

### Public vs internal boundary

- Public deployment hosts anonymous explorer only
- Governed deployment hosts the same static shell plus protected routes and APIs
- Shared review data is never exposed to public routes
- Public sample exports do not write export history

### Recommended Azure deployment model

- Azure Static Web Apps Standard for front-end
- Azure Functions or Container Apps for governed APIs
- Azure Cosmos DB or Azure SQL for review records
- Blob Storage for evidence artifacts and export packages
- Azure Key Vault for secrets
- Log Analytics + Application Insights for telemetry and audit forwarding

### Secure config handling

- Store secrets in Key Vault
- Surface only public read-only config to the front-end
- Use managed identity for API-to-data access
- Keep export policy and role mapping server-side for governed mode

### Logging and audit

- Log every write event with actor, entity, action, and timestamp
- Record export requests and included maturity states
- Forward audit data to Log Analytics / SIEM
- Never rely on browser logs for governed audit evidence

## 9. Engineering architecture

### Component architecture

- `index.html`: minimal shell
- `app/main.mjs`: routing, rendering, orchestration
- `app/utils.mjs`: parsing and formatting helpers
- `app/auth.mjs`: auth state loader and role checks
- `app/exporter.mjs`: sample export generation
- `app/data/reviewMeta.mjs`: maturity and severity metadata
- `app/data/siteContent.mjs`: product copy and static content

### State model

- Global client state for auth, loaded items, filters, export options, and local notes
- URL query string as the source of truth for explorer filter state
- LocalStorage for public demo notes only

### Route map

- Public: `/`, `/explorer`, `/services`, `/method`, `/roadmap`
- Governed: `/workspace`, `/reports`, `/admin`

### Data loading strategy

- Fetch CSV datasets on load
- Normalize rows into `ReviewItem` objects
- Overlay curated metadata from `reviewMeta.mjs`
- Fail closed with a clear error state if data cannot be loaded

### Caching approach

- Browser cache for static assets and CSV data
- SWA static asset caching in production
- Governed APIs should use server-side caching only for read-only reference data, not mutable review records

### Error boundary strategy

- Full-page error state for data load failure
- Filter empty state for no matching results
- Governed access denied state for auth/role failure

### Feature flags

- Public demo is always on
- Governed features require deployment configuration plus auth
- Future flags: `governedApiEnabled`, `evidenceUploadEnabled`, `exportAuditEnabled`

### Suggested folder structure

```text
/app
  /data
    reviewMeta.mjs
    siteContent.mjs
  auth.mjs
  exporter.mjs
  main.mjs
  styles.css
/data
  research_knowledge_base.csv
  source_register.csv
/docs
  implementation-package.md
index.html
staticwebapp.config.json
```

### Coding conventions

- Strongly typed domain contracts even in static-first mode
- One route, one page purpose
- No public copy that implies hidden enterprise features
- Maturity and export logic centralized in one domain layer

### Test strategy

- Route smoke test for each public and governed path
- Filter and deep-link test coverage for explorer
- Export rule tests covering GA-only default and advisory/preview opt-in
- Auth gate tests for `/workspace`, `/reports`, `/admin`

### Telemetry

- Page view by route and mode
- Explorer filter usage
- Sample export generation count
- Auth gate hit count on governed routes
- Client load failures for reference data

## 10. Export/reporting model

### Public demo export flow

1. User filters the explorer
2. Default export posture includes only GA-ready items
3. User may explicitly include advisory and preview items
4. Generated sample export shows maturity mix and source traceability
5. No shared audit record is written

### Governed export flow

1. Authenticated user opens governed workspace
2. User selects template and export scope
3. System evaluates maturity composition
4. System requires explicit confirmation if advisory or preview content is included
5. Export manifest and audit event are written
6. Artifact is stored and linked from export history

### Report metadata model

```ts
export interface ReportMetadata {
  reportId: string;
  workspaceId?: string;
  mode: "public-demo" | "governed";
  generatedBy?: string;
  generatedAt: string;
  maturityMix: Record<string, number>;
  sourceCount: number;
  includedMaturity: Array<"GA-ready" | "Advisory" | "Preview" | "Deprecated">;
  filtersApplied: Record<string, string | string[]>;
}
```

### Export eligibility rules

- GA-ready: yes by default
- Advisory: only when user opts in
- Preview: only when user opts in
- Deprecated: no by default, explicit exceptional handling only

### Audit event examples

```json
{
  "entityType": "export",
  "entityId": "exp-2026-004",
  "action": "export.generated",
  "actorId": "u-reviewer-02",
  "occurredAt": "2026-03-29T10:45:00Z",
  "payloadHash": "sha256:..."
}
```

## 11. Backlog

| Title | Description | Owner role | Priority | Effort | Dependencies | Acceptance criteria |
|---|---|---|---|---|---|---|
| Public homepage cleanup | Replace mixed-mode copy and overloaded hero | Staff Product Engineer | P0 | M | None | Homepage has one primary CTA, separate mode cards, and no fake persistence claims |
| Explorer-first navigation | Make explorer the default product core | Staff Product Engineer | P0 | M | Homepage cleanup | Explorer supports service, family, maturity, severity, category, and search filters |
| Maturity rule engine | Centralize badge and export behavior | Principal Azure Architect | P0 | S | None | GA-only export default and explicit override logic are enforced in code |
| Public export disclosure | Show maturity mix and sample export limitations | Staff Product Engineer | P0 | S | Maturity rule engine | Every export includes maturity mix and source traceability |
| SWA route protection | Protect governed routes and add secure headers | Principal Security Architect | P0 | S | None | `/workspace`, `/reports`, and `/admin` are protected in SWA config |
| Governed auth shell | Add truthful sign-in gates and authenticated shell states | Staff Product Engineer | P1 | M | SWA route protection | Public users cannot confuse governed routes with live shared workflow |
| Role model and RBAC mapping | Define Viewer, Reviewer, Architect, Admin controls | Principal Security Architect | P1 | M | Governed auth shell | Route and API tables exist and roles map cleanly to actions |
| Review workspace API | Create durable CRUD for workspaces and review-item state | Staff Product Engineer | P1 | L | Role model and RBAC mapping | Reviewers can create, update, and read governed workspaces |
| Evidence and decision records | Add evidence capture and decision log endpoints | Principal Azure Architect | P1 | L | Review workspace API | Evidence and decisions persist with actor and timestamp |
| Governed export history | Record exports, maturity mix, and audit events | Senior Director, Cloud Solution Architecture | P1 | M | Review workspace API | Every governed export writes history and audit entries |
| Admin policy controls | Manage source baseline, export policy, and retention | Principal Security Architect | P2 | L | Governed export history | Admin-only controls exist and are hidden from non-admin roles |
| Enterprise telemetry and SIEM integration | Forward audit and operational events | Senior Director, Cloud Solution Architecture | P2 | M | Governed export history | Audit and operational data are queryable in Log Analytics |

## 12. Rollout plan

### Phase 1: Clarity and polish

- Scope: homepage rewrite, explorer-first navigation, public/demo copy cleanup, service-first entry points
- Exit criteria: public users understand the demo boundary in one scan and can reach the explorer immediately

### Phase 2: Governance controls

- Scope: maturity rule engine, export warnings, default GA-only posture, protected route scaffolding
- Exit criteria: the product enforces safe defaults instead of only describing them

### Phase 3: Authenticated workspace

- Scope: Entra auth, review workspace API, evidence, decisions, export history
- Exit criteria: internal users can execute and persist governed reviews with role-aware access

### Phase 4: Enterprise hardening

- Scope: admin controls, retention, audit forwarding, telemetry, operational support model
- Exit criteria: security and architecture leadership can approve the platform for internal use

## 13. QA checklist

### Accessibility

- Keyboard navigation reaches every nav link, filter, and export control
- Focus states are visible on all interactive elements
- Color is never the only signal for maturity or severity
- Contrast passes for badges, warning boxes, and buttons

### Security

- Governed routes reject anonymous access in SWA
- Admin route rejects non-admin users
- Public demo never exposes governed API payloads
- Export warnings appear before non-GA content is included

### Content

- Home page contains no mixed-mode claims
- Public demo copy never implies persistence or collaboration
- Method page explains what the product is, is not, and what requires governed mode
- Roadmap stays separate from the main public journey

### Routing

- Every route renders a valid page state
- Explorer deep links restore filters and selected item
- Not-found state is clean and recoverable
- Governed gate states are clear and non-deceptive

### Export correctness

- Default export contains only GA-ready items
- Advisory and preview inclusion requires explicit selection
- Export output always includes maturity mix
- Public demo export never creates governed audit history

## 14. Sample implementation snippets

### Route guard

```ts
const governedRoutes = {
  "/workspace": ["authenticated"],
  "/reports": ["authenticated"],
  "/admin": ["admin"]
};

function canAccessRoute(path: string, roles: string[]) {
  const required = governedRoutes[path];
  if (!required) return true;
  return required.some((role) => roles.includes(role));
}
```

### Export rule logic

```ts
function canIncludeInExport(item: ReviewItem, options: {
  includeAdvisory: boolean;
  includePreview: boolean;
}) {
  if (item.maturity === "GA-ready") return true;
  if (item.maturity === "Advisory") return options.includeAdvisory;
  if (item.maturity === "Preview") return options.includePreview;
  return false;
}
```

### Role check

```ts
function canRecordDecision(roles: string[]) {
  return roles.includes("architect") || roles.includes("admin");
}
```

### Review item contract

```ts
type Maturity = "GA-ready" | "Advisory" | "Preview" | "Deprecated";
type Severity = "High" | "Medium" | "Low";

interface ReviewItem {
  id: string;
  title: string;
  serviceName: string;
  serviceFamily: string;
  severity: Severity;
  maturity: Maturity;
  sourceUrl: string;
  exportEligible: boolean;
  requiresExplicitOverride: boolean;
}
```
