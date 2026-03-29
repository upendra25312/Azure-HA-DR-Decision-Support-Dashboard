import csv
from collections import defaultdict

input_file = 'data/rto_rpo_decision_matrix_fully_expanded.csv'
output_file = 'data/rto_rpo_decision_matrix_fully_expanded_filled.csv'

# Fields that are considered recommendation fields (to be filled)
RECOMMENDATION_FIELDS = [
    'Recommended HA Strategy',
    'Recommended DR Strategy',
    'Recommended Architecture Pattern',
    'Recommended Replication Approach',
    'Recommended Failover Method',
    'Recommendation Scope',
    'Delivers Local Resiliency',
    'Delivers Zonal Resiliency',
    'Delivers Regional Resiliency',
    'Why This Fits',
    'Key Caveats',
    'Operational Prerequisites',
    'Cost Level',
    'Complexity Level',
    'Primary Diagram Link',
    'Primary Documentation Link',
    'Decision Confidence',
    'Date Reviewed'
]

# Load all rows
with open(input_file, newline='', encoding='utf-8') as f:
    reader = list(csv.DictReader(f))
    fieldnames = reader[0].keys()

# Index rows by decreasing strictness of key fields
# Most strict: all fields, then drop one at a time
KEY_FIELDS = [
    'Azure Service',
    'Workload Category',
    'Criticality',
    'RTO Band',
    'RPO Band',
    'Region Preference',
    'Topology Preference',
    'Cost Sensitivity',
    'Simplicity vs Resilience'
]

# Build a lookup for all rows with recommendation data
recommendation_lookup = defaultdict(list)
for row in reader:
    if any(row[f] for f in RECOMMENDATION_FIELDS):
        key = tuple(row[k] for k in KEY_FIELDS)
        recommendation_lookup[key].append(row)

# Helper: find best match for a blank row
from itertools import combinations

def find_best_match(blank_row):
    # Try all combinations of key fields, from most to least strict
    for n in range(len(KEY_FIELDS), 1, -1):
        for fields in combinations(KEY_FIELDS, n):
            key = tuple(blank_row[k] for k in fields)
            # Find all rows that match on these fields
            for rec_key, rec_rows in recommendation_lookup.items():
                if all((k in fields and blank_row[k] == rec_key[i]) or k not in fields for i, k in enumerate(KEY_FIELDS)):
                    # Return the first row with data
                    for rec_row in rec_rows:
                        return rec_row
    return None

# Fill in blanks
filled_rows = []
for row in reader:
    if all(not row[f] for f in RECOMMENDATION_FIELDS):
        best = find_best_match(row)
        if best:
            for f in RECOMMENDATION_FIELDS:
                row[f] = best[f]
    filled_rows.append(row)

with open(output_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(filled_rows)

print(f"Filled CSV written to {output_file} with {len(filled_rows)} rows.")
