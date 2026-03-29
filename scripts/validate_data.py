from __future__ import annotations

import csv
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"

REQUIRED_FILES = {
    "service_catalog_template.csv": [
        "Service Category",
        "Azure Service",
        "Workload Category",
        "Deployment Model / SKU",
        "Stateful or Stateless",
    ],
    "research_knowledge_base.csv": [
        "Azure Service",
        "HA Capability Summary",
        "DR Capability Summary",
        "Expected RTO Range",
        "Expected RPO Range",
    ],
    "rto_rpo_decision_matrix.csv": [
        "Azure Service",
        "RTO Band",
        "RPO Band",
        "Recommended HA Strategy",
        "Recommended DR Strategy",
    ],
    "source_register.csv": [
        "Source Title",
        "Source URL",
        "Date Accessed",
        "Confidence",
    ],
    "architecture_references.csv": [
        "Azure Service",
        "Pattern Name",
        "Microsoft Learn Page URL",
    ],
}


def load_header(path: Path) -> list[str]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.reader(handle)
        return next(reader, [])


def main() -> int:
    failures: list[str] = []

    for file_name, required_columns in REQUIRED_FILES.items():
        path = DATA_DIR / file_name
        if not path.exists():
            failures.append(f"Missing file: {path}")
            continue

        header = load_header(path)
        missing = [column for column in required_columns if column not in header]
        if missing:
            failures.append(f"{file_name} is missing columns: {', '.join(missing)}")

    if failures:
        print("Validation failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("Validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
