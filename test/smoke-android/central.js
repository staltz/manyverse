// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

module.exports = function (driver, t) {
  t.test('Central screen is displayed with three tabs', async function (t) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Public header in the Central screen',
    );
    await driver.sleep(3000);
    // Public tab
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("No messages")',
        8000,
      ),
      'I see the Public tab body with no messages',
    );
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Public Tab Button")',
      ),
      'I see Public tab button',
    );

    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab, 'I see the Floating Action Button');
    await fab.click();
    t.pass('I tap it');

    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput, 'I see the Compose Text Input in Compose screen');

    await composeTextInput.keys('Hello world today is a sunny day');
    t.pass('I type a message into it');
    const f2 = await composeTextInput.text();
    t.equal(f2.length, 32, 'Its text content is non-empty');

    const composePreviewButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Preview Button")',
      6000,
    );
    t.ok(composePreviewButton, 'I see the Preview Message Button');
    await composePreviewButton.click();
    t.pass('I tap it');

    const composePublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Publish Message Button")',
      6000,
    );
    t.ok(composePublishButton, 'I see the Publish Message Button');
    await composePublishButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Public header in the Central screen',
    );

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Hello world today is a sunny day")',
        6000,
      ),
      'I see the new message posted on the feed',
    );

    t.end();
  });
};
