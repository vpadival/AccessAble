import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

/**
 * Runs an accessibility scan on a given URL using Playwright and axe-core.
 *
 * @param {string} url - The web page URL to audit
 * @returns {Promise<object>} The raw, unmodified axe-core analyze() results object
 */
export async function runScan(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('A valid URL string must be provided to runScan.');
  }

  // Validate URL structure upfront
  try {
    new URL(url);
  } catch (err) {
    throw new Error(`Invalid URL provided: "${url}". Please include protocol (e.g. http:// or https://).`);
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to URL and wait for network idle
    try {
      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });
    } catch (navError) {
      throw new Error(`Failed to load target URL "${url}": ${navError.message}`);
    }

    // Invalidate if page is unreachable or encountered major load error
    const Axe = AxeBuilder.default || AxeBuilder;
    const results = await new Axe({ page }).analyze();

    return results;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
