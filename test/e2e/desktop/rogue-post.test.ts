// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import {expect, test} from '@playwright/test';
import {Page} from 'playwright-core';
import setup, {stageDatabase} from './utils';
const ssbKeys = require('ssb-keys');
const p = require('util').promisify;

const ctx = setup('rogue-post', async (path: string) => {
  const ssb = stageDatabase(path);
  const bobKeys = ssbKeys.generate('ed25519', 'bob', 'classic');

  await p(ssb.db.create)({
    keys: bobKeys,
    content: {type: 'about', about: bobKeys.id, name: 'Bob'},
  });

  await p(ssb.db.create)({
    keys: bobKeys,
    content: {type: 'post'}, // Missing `text` field
  });

  await p(ssb.close)(true);
});

let page: Page;

test.describe('resilient to rogue post msg with .text missing', () => {
  test('renders post author', async () => {
    page = await ctx.electronApp!.firstWindow();

    expect(await page.waitForSelector('"Bob"')).toBeTruthy();
  });
});
