import csv
import itertools
import os

# Path to your current CSV
INPUT_CSV = 'data/rto_rpo_decision_matrix.csv'
OUTPUT_CSV = 'data/rto_rpo_decision_matrix_expanded.csv'

# Define all possible values for each field (update as needed)
RTO_BANDS = ['Band A', 'Band B', 'Band C', 'Band D']
RPO_BANDS = ['Band A', 'Band B', 'Band C', 'Band D']
REGION_PREFS = ['Single Region', 'Single Region, Multiple Zones', 'Multiple Regions']
TOPOLOGY_PREFS = ['Active-Active', 'Active-Passive (Hot Standby)', 'Active-Passive (Cold Standby)']
COST_SENS = ['Low', 'Medium', 'High']
SIMPLICITY = ['Simplicity', 'Balanced', 'Resilience']

# Read the original CSV
with open(INPUT_CSV, newline='', encoding='utf-8') as infile:
    reader = csv.DictReader(infile)
    rows = list(reader)
    fieldnames = reader.fieldnames

# Find which fields are present
required_fields = [
    'Azure Service', 'Workload Category', 'Criticality',
    'RTO Band', 'RPO Band', 'Region Preference', 'Topology Preference',
    'Cost Sensitivity', 'Simplicity vs Resilience'
]

# Prepare expanded rows
expanded_rows = []
for row in rows:
    # For each row, expand all combinations of the missing fields
    rto_band = [row['RTO Band']] if row['RTO Band'] else RTO_BANDS
    rpo_band = [row['RPO Band']] if row['RPO Band'] else RPO_BANDS
    region_pref = [row['Region Preference']] if row.get('Region Preference') else REGION_PREFS
    topology_pref = [row['Topology Preference']] if row.get('Topology Preference') else TOPOLOGY_PREFS
    cost_sens = [row['Cost Sensitivity']] if row.get('Cost Sensitivity') else COST_SENS
    simplicity = [row['Simplicity vs Resilience']] if row.get('Simplicity vs Resilience') else SIMPLICITY

    for combo in itertools.product(rto_band, rpo_band, region_pref, topology_pref, cost_sens, simplicity):
        new_row = row.copy()
        new_row['RTO Band'] = combo[0]
        new_row['RPO Band'] = combo[1]
        new_row['Region Preference'] = combo[2]
        new_row['Topology Preference'] = combo[3]
        new_row['Cost Sensitivity'] = combo[4]
        new_row['Simplicity vs Resilience'] = combo[5]
        expanded_rows.append(new_row)

# Remove duplicates (optional, based on all required fields)
unique_rows = {tuple(row[field] for field in required_fields): row for row in expanded_rows}

# Write the expanded CSV
with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as outfile:
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in unique_rows.values():
        writer.writerow(row)

print(f"Expanded CSV written to {OUTPUT_CSV} with {len(unique_rows)} rows.")
