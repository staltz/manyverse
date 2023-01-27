// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import {expect, test} from '@playwright/test';
import {Page} from 'playwright-core';
import setup, {stageDatabase} from './utils';
const p = require('util').promisify;

const ctx = setup('compose-draft-save', async (path: string) => {
  const ssb = stageDatabase(path);

  await p(ssb.db.create)({
    keys: ssb.config.keys,
    content: {type: 'about', about: ssb.id, name: 'Andrew'},
  });

  await p(ssb.close)(true);
});

let page: Page;

const POST_TEXT = `# Foo

_bar_

> baz
`;

test.describe('save compose draft', () => {
  test('opens', async () => {
    page = await ctx.electronApp!.firstWindow();

    const composeButtonLocator = page.locator(
      '[aria-label="Floating Action Button"]',
    );

    await composeButtonLocator.waitFor();
    await composeButtonLocator.click();
  });

  test('input post content', async () => {
    const composeInputLocator = page.getByPlaceholder('Write a public message');
    await expect(composeInputLocator).toBeFocused();
    await composeInputLocator.fill(POST_TEXT);

    // Wait a second so that the draft can be saved to storage
    await page.waitForTimeout(1000);

    await page.getByRole('button', {name: 'Close Button', exact: true}).click();
  });

  test('compose button visually indicates draft existence', async () => {
    const composeButtonLocator = page.locator(
      '[aria-label="Floating Action Button"]',
    );

    await composeButtonLocator.waitFor();

    await expect(composeButtonLocator).toHaveCSS(
      'background-color',
      // Orangish-yellow color
      'rgb(252, 196, 25)',
    );

    await composeButtonLocator.click();
  });

  test('can see saved draft content', async () => {
    const composeInputLocator = page.getByPlaceholder('Write a public message');
    await composeInputLocator.waitFor();
    await expect(composeInputLocator).toHaveValue(POST_TEXT);
  });
});
