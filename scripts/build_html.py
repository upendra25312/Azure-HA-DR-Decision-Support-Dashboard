from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUTPUT_PATH = ROOT / "dashboard.html"
SERVICE_CATALOG_PATH = DATA_DIR / "service_catalog_template.csv"


def get_service_options() -> list[str]:
    """Reads the service catalog and returns a list of unique Azure services."""
    services = set()
    with SERVICE_CATALOG_PATH.open("r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            services.add(row["Azure Service"])
    return sorted(list(services))


def get_column_options(column_name: str) -> list[str]:
    """Reads the service catalog and returns a list of unique values for a given column."""
    options = set()
    with SERVICE_CATALOG_PATH.open("r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row[column_name]:
                options.add(row[column_name])
    return sorted(list(options))


def get_criticality_options() -> list[str]:
    """Reads the service catalog and returns a list of unique criticality options."""
    options = set()
    with SERVICE_CATALOG_PATH.open("r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row["Criticality Options"]:
                for option in row["Criticality Options"].split("|"):
                    options.add(option.strip())
    return sorted(list(options))


def build_html_dashboard() -> None:
    """Generates an interactive HTML dashboard."""

    azure_services = get_service_options()
    workload_categories = get_column_options("Workload Category")
    criticality_options = get_criticality_options()

    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azure HA/DR Interactive Dashboard</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 2em; }}
        h1 {{ color: #0078D4; }}
        .dashboard-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2em;
        }}
        .input-section, .output-section {{
            border: 1px solid #ccc;
            padding: 1em;
            border-radius: 8px;
        }}
        label {{
            display: block;
            margin-bottom: 0.5em;
            font-weight: bold;
        }}
        select, input {{
            width: 100%;
            padding: 8px;
            margin-bottom: 1em;
            border-radius: 4px;
            border: 1px solid #ccc;
        }}
        .output-field {{
            margin-bottom: 1em;
        }}
        .output-field label {{
            color: #333;
        }}
        .output-field p {{
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 4px;
            min-height: 20px;
        }}
    </style>
</head>
<body>
    <h1>Azure HA/DR Interactive Dashboard</h1>
    <div class="dashboard-grid">
        <div class="input-section">
            <h2>Inputs</h2>
            <label for="azure-service">Select Azure Service</label>
            <select id="azure-service">
                <option value="">--Please choose an option--</option>
                {''.join(f'<option value="{service}">{service}</option>' for service in azure_services)}
            </select>

            <label for="workload-category">Select Workload Category</label>
            <select id="workload-category">
                <option value="">--Please choose an option--</option>
                {''.join(f'<option value="{category}">{category}</option>' for category in workload_categories)}
            </select>

            <label for="criticality">Select Criticality</label>
            <select id="criticality">
                <option value="">--Please choose an option--</option>
                {''.join(f'<option value="{option}">{option}</option>' for option in criticality_options)}
            </select>

            <label for="rto">Desired RTO</label>
            <input type="text" id="rto">

            <label for="rpo">Desired RPO</label>
            <input type="text" id="rpo">

            <label for="region-preference">Region / Zone Preference</label>
            <input type="text" id="region-preference">

            <label for="topology-preference">Topology Preference</label>
            <input type="text" id="topology-preference">

            <label for="cost-sensitivity">Cost Sensitivity</label>
            <select id="cost-sensitivity">
                <option value="">--Please choose an option--</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
            </select>

            <label for="simplicity-resilience">Simplicity vs Resilience</label>
            <select id="simplicity-resilience">
                <option value="">--Please choose an option--</option>
                <option value="Simplicity">Prioritize Simplicity</option>
                <option value="Balanced">Balanced</option>
                <option value="Resilience">Prioritize Resilience</option>
            </select>
        </div>
        <div class="output-section">
            <h2>Recommendations</h2>
            <div class="output-field">
                <label>Recommended HA Approach</label>
                <p id="ha-approach"></p>
            </div>
            <div class="output-field">
                <label>Recommended DR Approach</label>
                <p id="dr-approach"></p>
            </div>
            <div class="output-field">
                <label>Recommended Architecture Pattern</label>
                <p id="architecture-pattern"></p>
            </div>
            <div class="output-field">
                <label>Resiliency Classification</label>
                <p id="resiliency-classification"></p>
            </div>
            <div class="output-field">
                <label>Technical Reasoning</label>
                <p id="technical-reasoning"></p>
            </div>
            <div class="output-field">
                <label>Architecture References</label>
                <p id="architecture-references"></p>
            </div>
            <div class="output-field">
                <label>Best Practice Links</label>
                <p id="best-practice-links"></p>
            </div>
            <div class="output-field">
                <label>Limitations and Risks</label>
                <p id="limitations-risks"></p>
            </div>
            <div class="output-field">
                <label>Operational Guidance</label>
                <p id="operational-guidance"></p>
            </div>
            <div class="output-field">
                <label>Leadership Summary</label>
                <p id="leadership-summary"></p>
            </div>
        </div>
    </div>
    <script>
        // JavaScript to add interactivity will go here
        console.log("Dashboard loaded");
    </script>
</body>
</html>
"""
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"HTML dashboard created at: {OUTPUT_PATH}")


if __name__ == "__main__":
    build_html_dashboard()
