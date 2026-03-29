import csv

INPUT_CSV = 'data/rto_rpo_decision_matrix_expanded.csv'
OUTPUT_CSV = 'data/rto_rpo_decision_matrix_expanded_cleaned.csv'

# List of known malformed or unwanted workload categories
MALFORMED = ['and Platform Dependencies', ' and Platform Dependencies']

with open(INPUT_CSV, newline='', encoding='utf-8') as infile:
    reader = csv.DictReader(infile)
    rows = list(reader)
    fieldnames = reader.fieldnames

# Remove rows with malformed workload categories
cleaned_rows = [row for row in rows if row['Workload Category'] not in MALFORMED]

with open(OUTPUT_CSV, 'w', newline='', encoding='utf-8') as outfile:
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in cleaned_rows:
        writer.writerow(row)

print(f"Cleaned CSV written to {OUTPUT_CSV} with {len(cleaned_rows)} rows.")
