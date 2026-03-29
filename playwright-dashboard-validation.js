const { chromium } = require('playwright');

(async () => {
	try {
		const browser = await chromium.launch({ headless: true });
		const page = await browser.newPage();
		let consoleErrors = [];

		// Capture console errors
		page.on('console', msg => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		await page.goto('http://localhost:8000/index.html', { waitUntil: 'domcontentloaded' });

		// Step 1: Dropdown population validation
		const dropdowns = [
			{ selector: '#azure-service', name: 'Azure Service' },
			{ selector: '#workload-category', name: 'Workload Category' },
			{ selector: '#criticality', name: 'Criticality' },
			{ selector: '#rto', name: 'Desired RTO' },
			{ selector: '#rpo', name: 'Desired RPO' },
			{ selector: '#topology-preference', name: 'Topology Preference' }
		];
		let allDropdownsPopulated = true;
		for (const dd of dropdowns) {
			await page.waitForSelector(dd.selector, { timeout: 5000 });
			const options = await page.$$eval(`${dd.selector} option`, opts => opts.map(o => o.textContent.trim()));
			if (options.length > 1) {
				console.log(`✅ ${dd.name} options:`, options);
			} else {
				console.log(`❌ ${dd.name} did not populate.`);
				allDropdownsPopulated = false;
			}
		}

		// Step 2: Dynamic selection and recommendation validation
		const azureServiceOptions = await page.$$eval('#azure-service option', opts => opts.map(o => o.value).filter(v => v && v !== ''));
		for (const value of azureServiceOptions) {
			await page.selectOption('#azure-service', value);
			await page.waitForTimeout(200);
			const recommendation = await page.$eval('#decision-posture', el => el.textContent.trim());
			console.log(`Selected Azure Service: ${value} | Recommendation: ${recommendation}`);
		}

		// Step 3: Edge Cases & Error Handling
		console.log('\n--- Edge Case Tests ---');
		// 1. Select only placeholders in all dropdowns
		const placeholderSelections = {
			'#azure-service': '',
			'#workload-category': '',
			'#criticality': '',
			'#rto': '',
			'#rpo': '',
			'#topology-preference': ''
		};
		for (const [selector, value] of Object.entries(placeholderSelections)) {
			await page.selectOption(selector, value);
			await page.waitForTimeout(100);
		}
		let recommendation = '';
		try {
			recommendation = await page.$eval('#decision-posture', el => el.textContent.trim());
		} catch (e) {
			recommendation = '[Not found]';
		}
		console.log(`All placeholders selected | Recommendation Posture: ${recommendation}`);
		if (consoleErrors.length > 0) {
			console.log('❌ Console errors detected after placeholder selection:');
			consoleErrors.forEach(e => console.log(e));
		}

		// 2. Rapidly change selections to simulate fast user input
		const rapidServices = ['Azure SQL Database', 'Azure Cosmos DB', 'Azure App Service'];
		for (const label of rapidServices) {
			await page.selectOption('#azure-service', { label });
			await page.waitForTimeout(100);
		}
		try {
			recommendation = await page.$eval('#decision-posture', el => el.textContent.trim());
		} catch (e) {
			recommendation = '[Not found]';
		}
		console.log(`Rapid selection | Recommendation Posture: ${recommendation}`);
		if (consoleErrors.length > 0) {
			console.log('❌ Console errors detected after rapid selection:');
			consoleErrors.forEach(e => console.log(e));
		}

		// 3. (Optional) Test with missing/malformed data would require backend/data manipulation

		await browser.close();
		if (consoleErrors.length === 0) {
			console.log('✅ No console errors detected during test.');
		}
	} catch (err) {
		console.error('Test script error:', err);
		process.exit(1);
	}
})();
