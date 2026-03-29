# Azure HA/DR Research Dashboard

This project bootstraps an Excel-first research and decision-support solution for Azure high availability (HA) and disaster recovery (DR) strategy by service and RTO/RPO target.

## Deliverables

- Structured research dataset for Azure services, HA patterns, DR patterns, and Microsoft source evidence
- RTO/RPO decision matrix for service-pattern selection
- Excel workbook with an interactive dashboard and source-backed tabs
- Narrative research report and leadership summary
- Source register for traceability to Microsoft documentation

## Project Structure

- `data/`
  - Canonical CSV datasets that drive the workbook and research outputs
- `docs/`
  - Narrative report, executive summary, glossary, and assumptions
- `excel/`
  - Generated workbook and Excel-oriented notes
- `scripts/`
  - Utilities to validate datasets and build the Excel workbook

## Workflow

1. Populate `data/source_register.csv` with authoritative Microsoft references.
2. Research each service-pattern combination in `data/research_knowledge_base.csv`.
3. Derive or curate the recommendations in `data/rto_rpo_decision_matrix.csv`.
4. Add ranked diagram and architecture references to `data/architecture_references.csv`.
5. Run `scripts/validate_data.py` to catch missing fields and schema issues.
6. Run `scripts/build_workbook.py` to generate `excel/Azure-HA-DR-Dashboard.xlsx`.

## Environment

- Python 3.11+
- `openpyxl` for workbook generation

Install dependencies with:

```powershell
python -m pip install -r requirements.txt
```

## Notes

- The workbook is generated from CSV sources so the dashboard logic remains reviewable and traceable.
- The current scaffold contains headers, starter guidance, and placeholders only. It does not contain researched Microsoft content yet.
