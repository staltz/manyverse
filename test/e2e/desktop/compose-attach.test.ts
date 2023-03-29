// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import {expect, test} from '@playwright/test';
import {Locator, Page} from 'playwright-core';
import setup, {stageDatabase} from './utils';
const p = require('util').promisify;
const path = require('path');

const ctx = setup('compose', async (sessionPath: string) => {
  const ssb = stageDatabase(sessionPath);

  await p(ssb.db.create)({
    keys: ssb.config.keys,
    content: {type: 'about', about: ssb.id, name: 'Alice'},
  });

  await p(ssb.close)(true);
});

let page: Page;

test.describe('compose attachments', () => {
  let textField: Locator | null;
  test('opens', async () => {
    page = await ctx.electronApp!.firstWindow();

    const selector = '[aria-label="Floating Action Button"]';
    expect(await page.waitForSelector(selector)).toBeTruthy();
    await page.locator(selector).click();

    const textFieldSelector = '[placeholder="Write a public message"]';
    expect(await page.waitForSelector(textFieldSelector)).toBeTruthy();
    textField = page.locator(textFieldSelector);
    if (!textField) throw new Error('Could not find text field');
  });

  test.afterEach(async () => {
    await textField?.clear();
  });

  /**
   * Sets the text field to `text`, and the caret to `x` pixels from the left,
   * then verifies that the text field with the caret (as `|`) is equal to
   * `expected`.
   */
  async function setCursorPoint(
    text: string,
    position: number,
    expected: string,
  ) {
    // Set the text content
    await textField!.fill(text);

    // Position the caret
    await textField!.click({position: {x: position, y: 5}});
    await textField!.type('|');

    // Assert that the caret is correctly positioned
    expect(await textField!.inputValue()).toBe(expected);

    // Undo the assertion hacks
    await textField!.fill(text);
    await textField!.click({position: {x: position, y: 5}});
  }

  /**
   * Sets the text field to `text`, and the caret to select a range from `start`
   * to `end`, then verifies that the text field with the selection (as `#`) is
   * equal to `expected`.
   */
  async function setCursorRange(
    text: string,
    start: number,
    end: number,
    expected: string,
  ) {
    // Set the text content
    await textField!.fill(text);

    // Position the caret such that it selects a range in the text
    const box = await textField!.boundingBox();
    await page.mouse.move(box!.x + start, box!.y + 5);
    await page.mouse.down();
    await page.mouse.move(box!.x + end, box!.y + 5);
    await page.mouse.up();

    // Assert that the caret is correctly positioned
    const elemHandle = await textField?.elementHandle();
    const [before, selected, after] = await page.evaluate((elem: any) => {
      const before = elem.value.slice(0, elem.selectionStart);
      const selected = elem.value.slice(elem.selectionStart, elem.selectionEnd);
      const after = elem.value.slice(elem.selectionEnd);
      return [before, selected, after];
    }, elemHandle);
    const replaced = '#'.repeat(selected.length);
    const actual = `${before}${replaced}${after}`;
    expect(actual).toBe(expected);

    // Undo the assertion hacks
    await textField!.fill(text);
    await page.mouse.move(box!.x + start, box!.y + 5);
    await page.mouse.down();
    await page.mouse.move(box!.x + end, box!.y + 5);
    await page.mouse.up();
  }

  async function attachFixtureImage() {
    const imgAbsPath = path.resolve(__dirname, 'fixtures', 'image.png');

    // Attach fixture image
    const addPic = await page.$('#add_picture_desktop');
    await addPic!.setInputFiles([imgAbsPath]);

    // Hack the input element to workaround a Playwright bug
    // https://github.com/microsoft/playwright/issues/16846
    await page.evaluate(
      ([elem, imgPath]: any) => {
        if (!elem?.files?.[0]) throw new Error('Failed to set input files');
        const file = elem.files[0];
        if (file.path === '') file._e2eTestPath = imgPath;
      },
      [addPic, imgAbsPath],
    );

    // Add an empty caption when the caption popup appears
    await page.getByText('Done').click();
  }

  async function output() {
    return await textField!.inputValue();
  }

  const IMG_MD =
    '![image](&3YsRsROBjvS9i6VBDG7BpEovQN2aw2WyXD/O0GI31to=.sha256)';

  test('insert when empty', async () => {
    await attachFixtureImage();
    const expected = `${IMG_MD}

`;
    expect(await output()).toBe(expected);
  });

  test('insert at the beginning with no selection', async () => {
    await setCursorPoint('foobar', 0, '|foobar');
    await attachFixtureImage();
    const expected = `${IMG_MD}

foobar`;
    expect(await output()).toBe(expected);
  });

  test('insert at the end with no selection', async () => {
    await setCursorPoint('foobar', 100, 'foobar|');
    await attachFixtureImage();
    const expected = `foobar

${IMG_MD}

`;
    expect(await output()).toBe(expected);
  });

  test('insert with full selection', async () => {
    await setCursorRange('foobar', 0, 150, '######');
    await attachFixtureImage();
    const expected = `${IMG_MD}

`;
    expect(await output()).toBe(expected);
  });

  test('insert at the beginning with partial selection', async () => {
    await setCursorRange('foobar', 0, 30, '####ar');
    await attachFixtureImage();
    const expected = `${IMG_MD}

ar`;
    expect(await output()).toBe(expected);
  });

  test('insert at the end with partial selection', async () => {
    await setCursorRange('foobar', 15, 150, 'fo####');
    await attachFixtureImage();
    const expected = `fo

${IMG_MD}

`;
    expect(await output()).toBe(expected);
  });

  test('insert at the middle with partial selection', async () => {
    await setCursorRange('foobar', 15, 30, 'fo##ar');
    await attachFixtureImage();
    const expected = `fo

${IMG_MD}

ar`;
    expect(await output()).toBe(expected);
  });

  test('insert in the middle with no selection', async () => {
    await setCursorPoint('foobar', 20, 'foo|bar');
    await attachFixtureImage();
    const expected = `foo

${IMG_MD}

bar`;
    expect(await output()).toBe(expected);
  });
});
