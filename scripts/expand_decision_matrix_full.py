import csv
import itertools

# Load the original expanded/cleaned CSV
input_file = 'data/rto_rpo_decision_matrix_expanded_cleaned.csv'
output_file = 'data/rto_rpo_decision_matrix_fully_expanded.csv'

with open(input_file, newline='', encoding='utf-8') as f:
    reader = list(csv.DictReader(f))
    fieldnames = reader[0].keys()

# Get all unique values for each key field
services = sorted(set(row['Azure Service'] for row in reader))
workload_categories = {svc: sorted(set(row['Workload Category'] for row in reader if row['Azure Service'] == svc)) for svc in services}
criticalities = sorted(set(row['Criticality'] for row in reader))
rto_bands = sorted(set(row['RTO Band'] for row in reader))
rpo_bands = sorted(set(row['RPO Band'] for row in reader))
region_prefs = sorted(set(row['Region Preference'] for row in reader))
topologies = sorted(set(row['Topology Preference'] for row in reader))
cost_sensitivities = sorted(set(row['Cost Sensitivity'] for row in reader))
simplicities = sorted(set(row['Simplicity vs Resilience'] for row in reader))

# Index original rows for fast lookup
row_index = {(row['Azure Service'], row['Workload Category'], row['Criticality'], row['RTO Band'], row['RPO Band'], row['Region Preference'], row['Topology Preference'], row['Cost Sensitivity'], row['Simplicity vs Resilience']): row for row in reader}

# Generate all combinations
rows = []
for svc in services:
    for wlc in workload_categories[svc]:
        for crit, rto, rpo, region, topo, cost, simp in itertools.product(
            criticalities, rto_bands, rpo_bands, region_prefs, topologies, cost_sensitivities, simplicities):
            key = (svc, wlc, crit, rto, rpo, region, topo, cost, simp)
            if key in row_index:
                rows.append(row_index[key])
            else:
                # Create a blank row with just the key fields filled in
                blank = {fn: '' for fn in fieldnames}
                blank['Azure Service'] = svc
                blank['Workload Category'] = wlc
                blank['Criticality'] = crit
                blank['RTO Band'] = rto
                blank['RPO Band'] = rpo
                blank['Region Preference'] = region
                blank['Topology Preference'] = topo
                blank['Cost Sensitivity'] = cost
                blank['Simplicity vs Resilience'] = simp
                rows.append(blank)

with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print(f"Expanded CSV written to {output_file} with {len(rows)} rows.")
