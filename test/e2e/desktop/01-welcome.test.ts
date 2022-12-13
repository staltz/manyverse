// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import {expect, test} from '@playwright/test';
import {Page} from 'playwright-core';
import setup from './utils';

const ctx = setup();

let page: Page;

test.describe('welcome', () => {
  test('overview', async () => {
    page = await ctx.electronApp!.firstWindow();

    expect(await page.title()).toBe('Manyverse');
    expect(await page.waitForSelector('"Welcome to Manyverse!"')).toBeTruthy();
    await page.locator('text="Continue" >> nth=0').click();
  });

  test('off the grid', async () => {
    expect(await page.waitForSelector('"Off-the-grid"')).toBeTruthy();
    await page.locator('text="Continue" >> nth=1').click();
  });

  test('connections', async () => {
    expect(await page.waitForSelector('"Many ways to connect"')).toBeTruthy();
    await page.locator('text="Continue" >> nth=2').click();
  });

  test('moderation', async () => {
    expect(await page.waitForSelector('"Shared moderation"')).toBeTruthy();
    await page.locator('text="Continue" >> nth=3').click();
  });

  test('permanence', async () => {
    expect(await page.waitForSelector('"Permanence"')).toBeTruthy();
    await page.locator('text="Continue" >> nth=4').click();
  });

  test('in construction', async () => {
    expect(await page.waitForSelector('"In construction!"')).toBeTruthy();
    await page.locator('text="Continue" >> nth=5').click();
  });

  test('account', async () => {
    expect(
      await page.waitForSelector('"Is this your first time?"'),
    ).toBeTruthy();
    await page.locator('text="Create account"').click();
    await page.waitForTimeout(5000); // give it time to save to localstorage
  });
});
