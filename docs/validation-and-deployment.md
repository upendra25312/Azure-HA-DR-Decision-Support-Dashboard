# Validation, Extension, and Deployment Guide

## Automated UI Validation

- The Playwright script (`playwright-dashboard-validation.js`) validates dropdowns, recommendations, and edge cases.
- Run it after any code/data change to ensure dashboard integrity.

## How to Extend

- Add new test cases to the script for additional UI/logic scenarios.
- For new features, update both the dashboard and the test script.
- Use the script as a template for other automated UI tests.

## CI/CD Integration

- Add `node playwright-dashboard-validation.js` to your CI pipeline.
- Fail the build if any errors or failed validations are detected.

## Deployment/Sharing

- Share the project folder with the README and this guide.
- For production, host on Azure Static Web Apps, GitHub Pages, or any static site host.
- Optionally, containerize with a simple web server for cloud deployment.
