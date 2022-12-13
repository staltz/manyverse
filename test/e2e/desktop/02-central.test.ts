// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import {expect, test} from '@playwright/test';
import {Page} from 'playwright-core';
import setup from './utils';

const ctx = setup();

let page: Page;

test.describe('central', () => {
  test('public tab', async () => {
    page = await ctx.electronApp!.firstWindow();

    expect(await page.waitForSelector('"Public posts"')).toBeTruthy();
    expect(
      await page.waitForSelector(':has-text("Where is everybody")'),
    ).toBeTruthy();
  });

  test('private tab', async () => {
    await page.locator('text="Private"').click();
    expect(await page.waitForSelector('"Private chats"')).toBeTruthy();
    expect(
      await page.waitForSelector(':has-text("Where is everybody")'),
    ).toBeTruthy();
  });

  test('activity tab', async () => {
    await page.locator('text="Activity"').click();
    expect(await page.waitForSelector('"Activity"')).toBeTruthy();
    expect(
      await page.waitForSelector(':has-text("Where is everybody")'),
    ).toBeTruthy();
  });

  test('connections tab', async () => {
    await page.locator('text="Connections"').click();
    expect(await page.waitForSelector('"Connected peers"')).toBeTruthy();
    expect(await page.waitForSelector('"Not connected"')).toBeTruthy();
  });

  test('back to public tab', async () => {
    await page.locator('text="Public"').click();
    expect(await page.waitForSelector('"Public posts"')).toBeTruthy();
  });
});
