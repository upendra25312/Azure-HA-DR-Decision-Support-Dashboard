// playwright-dashboard.spec.js
// Automated Playwright test for Azure HA/DR Dashboard
// Validates dropdown population and dynamic recommendation updates

const { test, expect } = require('@playwright/test');

// Use local server URL for dashboard (not file://)
const DASHBOARD_URL = 'http://localhost:8000/index.html';

test.describe('Azure HA/DR Dashboard', () => {
  test('Dropdowns populate and recommendations update', async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    // Wait for Azure Service dropdown to be populated
    const serviceDropdown = await page.waitForSelector('#azure-service');
    const serviceOptions = await serviceDropdown.$$('option');
    expect(serviceOptions.length).toBeGreaterThan(1); // Should have options

    // Select a service (e.g., Azure SQL Database)
    await serviceDropdown.selectOption({ label: 'Azure SQL Database' });
    await page.waitForTimeout(500);

    // Wait for Workload Category dropdown to populate
    const workloadDropdown = await page.waitForSelector('#workload-category');
    await page.waitForTimeout(500); // Wait for dynamic update
    const workloadOptions = await workloadDropdown.$$('option');
    expect(workloadOptions.length).toBeGreaterThan(1);
    await workloadDropdown.selectOption({ label: 'Database' });
    await page.waitForTimeout(500);

    // Select Criticality
    const criticalityDropdown = await page.waitForSelector('#criticality');
    await criticalityDropdown.selectOption({ label: 'Critical (mission-critical business impact)' });
    await page.waitForTimeout(500);

    // Select RTO
    const rtoDropdown = await page.waitForSelector('#rto');
    await rtoDropdown.selectOption({ label: '1-4 hours' });
    await page.waitForTimeout(500);

    // Select RPO
    const rpoDropdown = await page.waitForSelector('#rpo');
    await rpoDropdown.selectOption({ label: '1-4 hours' });
    await page.waitForTimeout(500);

    // Select Region Preference
    const regionDropdown = await page.waitForSelector('#region-preference');
    await regionDropdown.selectOption({ label: 'Single Region' });
    await page.waitForTimeout(500);

    // Select Topology Preference
    const topologyDropdown = await page.waitForSelector('#topology-preference');
    await topologyDropdown.selectOption({ label: 'Active-Active' });
    await page.waitForTimeout(500);

    // Select Cost Sensitivity
    const costDropdown = await page.waitForSelector('#cost-sensitivity');
    await costDropdown.selectOption({ label: 'Low' });
    await page.waitForTimeout(500);

    // Select Simplicity vs Resilience
    const simplicityDropdown = await page.waitForSelector('#simplicity-resilience');
    // Log available options for debugging
    const simplicityOptions = await simplicityDropdown.$$('option');
    for (const opt of simplicityOptions) {
      const val = await opt.textContent();
      console.log('Simplicity option:', val);
    }
    await simplicityDropdown.selectOption({ label: 'Prioritize Simplicity' });
    await page.waitForTimeout(500);

    // Wait for recommendation to update
    await page.waitForTimeout(1000);
    const haApproach = await page.textContent('#ha-approach');
    const drApproach = await page.textContent('#dr-approach');
    expect(haApproach).not.toMatch(/N\/A|^\s*$/);
    expect(drApproach).not.toMatch(/N\/A|^\s*$/);
  });
});
