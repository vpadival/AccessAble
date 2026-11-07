import { navigateForScan } from './navigation.js';
import { chromium } from 'playwright';
import { approvedUrl } from './deployment-policy.js';
import AxeBuilder from '@axe-core/playwright';

/**
 * Runs an accessibility scan on a given URL using Playwright and axe-core.
 *
 * @param {string} url - The web page URL to audit
 * @returns {Promise<object>} The raw, unmodified axe-core analyze() results object
 */
export async function runScan(url, { allowedHosts } = {}) {
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
    if (allowedHosts && !approvedUrl(url, allowedHosts)) throw new Error('Target not allowed');
    const context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: false });
    context.setDefaultTimeout(30000);
    if (allowedHosts) await context.route('**/*', route => {
      const value = route.request().url();
      return approvedUrl(value, allowedHosts) ? route.continue() : route.abort('blockedbyclient');
    });
    const page = await context.newPage();

    await navigateForScan(page, url);

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
