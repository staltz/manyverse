// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import {expect, test} from '@playwright/test';
import {Page} from 'playwright-core';
import setup, {stageDatabase} from './utils';
const p = require('util').promisify;

const ctx = setup('compose-content-warning', async (path: string) => {
  const ssb = stageDatabase(path);

  await p(ssb.db.create)({
    keys: ssb.config.keys,
    content: {type: 'about', about: ssb.id, name: 'Andrew'},
  });

  await p(ssb.close)(true);
});

let page: Page;

const POST_TEXT = 'Manyverse is great';
const CONTENT_WARNING_TEXT = 'Contains fact';

test.describe('compose with content warning', () => {
  test('opens', async () => {
    page = await ctx.electronApp!.firstWindow();

    const composeButtonLocator = page.locator(
      '[aria-label="Floating Action Button"]',
    );

    await composeButtonLocator.waitFor();
    await composeButtonLocator.click();
  });

  test('can write on the text field', async () => {
    const composeInputLocator = page.getByPlaceholder('Write a public message');
    await expect(composeInputLocator).toBeFocused();
    await composeInputLocator.fill(POST_TEXT);
  });

  test('can add content warning', async () => {
    const contentWarningButtonLocator = page.getByRole('button', {
      name: 'Content Warning Button',
    });

    await contentWarningButtonLocator.click();

    const contentWarningInputLocator = page
      .locator('form')
      .getByRole('textbox');
    await expect(contentWarningInputLocator).toBeFocused();
    await contentWarningInputLocator.fill(CONTENT_WARNING_TEXT);

    await page.getByText('Done').click();
  });

  // TODO: Color is dependent on theme (in this case, light)
  test('compose screen indicates existence of content warning', async () => {
    await expect(
      page
        .getByRole('button', {
          name: 'Content Warning Button',
        })
        .getByText('CW', {exact: true}),
    ).toHaveCSS('color', 'rgb(66, 99, 235)');

    const previewButtonLocator = page.getByRole('button', {name: 'Preview'});
    await expect(previewButtonLocator).toBeVisible();
    await previewButtonLocator.click();

    await expect(
      page.getByText('Content Warning', {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText(CONTENT_WARNING_TEXT, {
        exact: true,
      }),
    ).toBeVisible();

    const viewHiddenContentButtonLocator = page.getByRole('button', {
      name: 'View',
    });

    await expect(viewHiddenContentButtonLocator).toBeVisible();

    await viewHiddenContentButtonLocator.click();

    // TODO: Ideally would use getByRole since it's pressable
    await expect(page.getByText('Hide', {exact: true})).toBeVisible();
    await expect(page.getByText(POST_TEXT, {exact: true})).toBeVisible();
  });

  test('can publish', async () => {
    const publishButtonLocator = page.getByRole('button', {name: 'Publish'});
    await publishButtonLocator.click();
    await publishButtonLocator.waitFor({state: 'hidden'});
  });

  test('can see my post on the feed and read it', async () => {
    await page.getByText('Content Warning', {exact: true}).waitFor();
    await expect(
      page.getByText(CONTENT_WARNING_TEXT, {exact: true}),
    ).toBeVisible();
    await page.getByRole('button', {name: 'View'}).click();
    await page.getByText(POST_TEXT).waitFor();
  });
});
