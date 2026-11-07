import { runScan } from './scanner.js';

const TEST_URL = 'https://www.w3.org/WAI/demos/bad/before/home.html';

async function main() {
  console.log(`Starting accessibility audit for: ${TEST_URL}`);
  const startTime = Date.now();

  try {
    const rawResults = await runScan(TEST_URL);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`\nScan completed successfully in ${duration}s.\n`);
    console.log(JSON.stringify(rawResults, null, 2));
  } catch (error) {
    console.error(`\nScan failed with error:`, error.message);
    process.exit(1);
  }
}

main();

