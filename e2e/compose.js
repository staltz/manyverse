/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tape');

module.exports = function(driver, t) {
  t.test('Compose screen allows posting new public message', async function(t) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
        6000,
      ),
      'I see the Messages header in the Central screen',
    );

    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab, 'I see the Floating Action Button');
    await fab.tap();
    t.pass('I tap it');
    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.pass('I see the Compose Text Input in the Compose screen');
    await composeTextInput.keys('Hello world today is a sunny day');
    t.pass('I type a message into it');
    const f2 = await composeTextInput.text();
    t.equal(f2.length, 32, 'Its text content is non-empty');
    const composePublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Publish Button")',
      6000,
    );
    t.pass('I see the Compose Publish Button');
    await composePublishButton.tap();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Hello world today is a sunny day")',
        6000,
      ),
      'I see the new message posted on the feed',
    );

    t.end();
  });

  t.test('Compose screen closes when keyboard gets closed', async function(t) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
        6000,
      ),
      'I see the Messages header in the Central screen',
    );

    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.pass('I see Floating Action Button');
    await fab.tap();
    t.pass('I tap it');
    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.pass('I see the Compose Text Input in the Compose screen');
    await driver.hideKeyboard();
    t.pass('I hide the keyboard');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Public Tab Button")',
      ),
      'I see the Central screen',
    );

    t.end();
  });
};
