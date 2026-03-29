# Azure Review Board

`Azure Review Board` is a static-first Azure architecture review product with two intentional modes:

- `Public Demo`: open exploration, source traceability, local-only notes, and sample exports.
- `Governed Workspace`: protected internal use with Microsoft Entra ID, role-aware routes, and a clear path to saved review records, evidence, and audit history.

This repository now ships the public demo experience and the governed boundary scaffolding for Azure Static Web Apps.

## Current surface

- Public homepage with a single primary action into the explorer
- Service-first explorer with maturity, severity, family, category, and search filters
- Local-only browser notes for public demo use
- Sample export flow with GA-only default behavior
- Governed routes for `/workspace`, `/reports`, and `/admin`
- Azure Static Web Apps route protection rules in `staticwebapp.config.json`

## What is not implemented in this repo

- Persistent governed review records
- Evidence storage and decision history APIs
- Export history and audit event persistence
- Admin workflows backed by a live identity and policy service

Those governed capabilities are described in [docs/implementation-package.md](/C:/Azure%20HA%20DR/docs/implementation-package.md).

## Run locally

1. Start a simple static server from the repo root.
2. Open `http://127.0.0.1:8000/`.

Example:

```powershell
python -m http.server 8000
```

Note: local `http.server` does not emulate Azure Static Web Apps authentication or history-route rewrites. The public demo works locally. Governed route enforcement is fully realized when deployed to Azure Static Web Apps Standard.

## Deploy on Azure

- Host the front-end on Azure Static Web Apps.
- Use the `Standard` plan for governed mode.
- Configure Microsoft Entra ID authentication.
- Add protected APIs and a durable backing store for governed review records.

## Repo layout

- `index.html`: static shell
- `app/`: public demo application, shared content, review metadata, styles, and route logic
- `data/`: source CSV inputs used by the public demo explorer
- `docs/implementation-package.md`: product, security, data, API, governance, export, and rollout package
- `staticwebapp.config.json`: route protection and security headers
