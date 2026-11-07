export async function navigateForScan(page, url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (response && response.status() >= 400) throw new Error(`Target returned HTTP ${response.status()}; no accessibility scan was performed`);
      await page.locator('body').waitFor({ state: 'attached', timeout: 10000 });
      return;
    } catch (error) {
      if (attempt === 0 && /net::ERR_HTTP2_PROTOCOL_ERROR/.test(error.message)) continue;
      const detail = /net::ERR_HTTP2_PROTOCOL_ERROR/.test(error.message)
        ? 'The target failed HTTP/2 navigation after one retry. The site or network may be incompatible with automated browsing; no accessibility result was generated.'
        : error.message;
      throw new Error(`Failed to load target URL "${url}": ${detail}`);
    }
  }
}
