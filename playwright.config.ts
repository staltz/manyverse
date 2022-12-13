import {PlaywrightTestConfig} from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './test/e2e/desktop',
  maxFailures: 2,
  workers: 1, // no parallelism
};

export default config;
