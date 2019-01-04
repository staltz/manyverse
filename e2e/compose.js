/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tape');
const {End, Home} = require('wd/lib/special-keys');

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
    t.ok(composeTextInput, 'I see the Compose Text Input in Compose screen');
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

  t.test('Compose screen does not close when keyboard closes', async function(
    t,
  ) {
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
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Text Input")',
        6000,
      ),
      'I see the Compose Text Input in Compose screen',
    );
    await driver.hideKeyboard();
    t.pass('I hide the keyboard');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Text Input")',
        6000,
      ),
      'I still see the Compose Text Input in Compose screen',
    );

    t.end();
  });

  t.test('Compose screen allows saving draft when exiting', async function(t) {
    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput, 'I see the Compose Text Input in Compose screen');
    await composeTextInput.keys('color of my shirt is green');
    t.pass('I type a partial message into it');
    const f = await composeTextInput.text();
    t.equal(f.length, 26, 'Its text content is non-empty');

    const closeButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Close Button")',
      6000,
    );
    t.pass('I see the Close Button');
    await closeButton.tap();
    t.pass('I tap it');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Save draft")',
      ),
      'I see a dialog prompt asking to save the draft',
    );

    const saveButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("Save")',
      6000,
    );
    t.ok(saveButton, 'I see the Save button');
    await saveButton.tap();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
        6000,
      ),
      'I see the Central screen',
    );

    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab, 'I see the Floating Action Button');
    await fab.tap();
    t.pass('I tap it');

    const composeTextInput2 = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput2, 'I see the Compose Text Input in Compose screen');
    const f2 = await composeTextInput2.text();
    t.equal(f2, 'color of my shirt is green', 'I see the saved draft text');

    const composePublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Publish Button")',
      6000,
    );
    t.pass('I see the Compose Publish Button');
    await composePublishButton.tap();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("color of my shirt is green")',
        6000,
      ),
      'I see the new message posted on the feed',
    );

    t.end();
  });

  t.test('Compose screen allows deleting draft when exiting', async function(
    t,
  ) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
        6000,
      ),
      'I see the Central screen',
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
    t.ok(composeTextInput, 'I see the Compose Text Input in Compose screen');
    await composeTextInput.keys('i do not want to publish this');
    t.pass('I type a partial message into it');
    const f = await composeTextInput.text();
    t.equal(f.length, 29, 'Its text content is non-empty');

    const closeButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Close Button")',
      6000,
    );
    t.pass('I see the Close Button');
    await closeButton.tap();
    t.pass('I tap it');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Save draft")',
      ),
      'I see a dialog prompt asking to save the draft',
    );

    const deleteButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("Delete")',
      6000,
    );
    t.ok(deleteButton, 'I see the Delete button');
    await deleteButton.tap();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
        6000,
      ),
      'I see the Central screen',
    );

    const fab2 = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab2, 'I see the Floating Action Button');
    await fab2.tap();
    t.pass('I tap it');

    await driver.sleep(2000);
    const composeTextInput2 = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput2, 'I see the Compose Text Input in Compose screen');
    const f2 = await composeTextInput2.text();
    t.equal(f2, 'Write a public message', 'I see empty text content');

    const closeButton2 = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Close Button")',
      6000,
    );
    t.pass('I see the Close Button');
    await closeButton2.tap();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
        6000,
      ),
      'I see the Central screen',
    );

    t.end();
  });
};
