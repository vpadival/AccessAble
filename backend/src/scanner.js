import { normalizeTargetUrl } from './target-url.js';
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
  url = normalizeTargetUrl(url);

  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chromium' });
    if (allowedHosts && !approvedUrl(url, allowedHosts)) throw new Error('Target not allowed');
    const context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: false });
    context.setDefaultTimeout(30000);
    if (allowedHosts) await context.route('**/*', route => {
      const value = route.request().url();
      return approvedUrl(value, allowedHosts) ? route.continue() : route.abort('blockedbyclient');
    });
    const page = await context.newPage();

    await navigateForScan(page, url);
    // A bounded load wait allows SPAs to render without requiring idle analytics connections.
    let readinessWarning = null;
    try { await page.waitForLoadState('load', { timeout: 10000 }); }
    catch { readinessWarning = 'Load event did not finish within 10 seconds; results cover the currently rendered DOM.'; }
    await page.locator('body').waitFor({state:'visible',timeout:10000});

    // Invalidate if page is unreachable or encountered major load error
    const Axe = AxeBuilder.default || AxeBuilder;
    const results = await new Axe({ page }).analyze();

    results.scanContext = { requestedUrl: url, finalUrl: page.url(), browser: 'chromium', readinessWarning };
    return results;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
