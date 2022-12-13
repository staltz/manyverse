// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import {expect, test} from '@playwright/test';
import {Page} from 'playwright-core';
import setup from './utils';

const ctx = setup();

let page: Page;

test.describe('compose', () => {
  test('opens', async () => {
    page = await ctx.electronApp!.firstWindow();

    const selector = '[aria-label="Floating Action Button"]';
    expect(await page.waitForSelector(selector)).toBeTruthy();
    await page.locator(selector).click();
  });

  test('can write on the text field', async () => {
    const fieldSelector = '[placeholder="Write a public message"]';
    expect(await page.waitForSelector(fieldSelector)).toBeTruthy();
    await page.locator(fieldSelector).fill('Hello mom');

    const buttonSelector = '"Preview"';
    expect(await page.waitForSelector(buttonSelector)).toBeTruthy();
    await page.locator(buttonSelector).click();

    const buttonSelector2 = '"Publish"';
    expect(await page.waitForSelector(buttonSelector2)).toBeTruthy();
    await page.locator(buttonSelector2).click();
  });

  test('can see my post on the feed', async () => {
    await page.waitForSelector('"Preview"', {state: 'hidden' as any});
    await page.waitForSelector('"Publish"', {state: 'hidden' as any});

    const postSelector = '"Hello mom"';
    expect(await page.waitForSelector(postSelector)).toBeTruthy();
  });
});
