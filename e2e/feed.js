/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tape');
const wd = require('wd');

module.exports = function(driver, t) {
  t.test('Central screen shows messages with Etc button', async function(t) {
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
      ),
      'I see the Messages header in the Central screen',
    );

    const chevron = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Etc Button")',
      6000,
    );
    t.ok(chevron, 'I see the Etc Button on a message');
    await chevron.tap();
    t.pass('I tap it');

    const menuItem = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("View raw message")',
      6000,
    );
    t.ok(menuItem, 'I see a menu with an option "View raw message"');
    await menuItem.tap();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Raw message")',
        6000,
      ),
      'I see the Raw Message screen',
    );

    await driver.back();
    t.pass('I press the (hardware) back button');

    t.end();
  });

  t.test('Central screen shows many in scrolling feed', async function(t) {
    await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.pass('I see the Floating Action Button');

    const AMOUNT = 10;
    t.pass('I begin creating ' + AMOUNT + ' public messages');
    for (let i = 1; i <= AMOUNT; i++) {
      const fab = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Floating Action Button")',
        6000,
      );
      await fab.tap();
      await driver.sleep(500);
      const composeTextInput = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Text Input")',
        4000,
      );
      await composeTextInput.keys('Message number ' + i + 'a');
      const composePublishButton = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Publish Button")',
        6000,
      );
      await composePublishButton.tap();
      await driver.sleep(1000);
    }
    t.pass('I created ' + AMOUNT + ' public messages');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Message number ' + AMOUNT + 'a")',
        6000,
      ),
      'I see message number ' + AMOUNT + ' on the feed',
    );

    const action = new wd.TouchAction(driver);
    action.press({x: 200, y: 1000});
    action.wait(60);
    action.moveTo({x: 200, y: 700});
    action.release();
    await driver.performTouchAction(action);
    t.pass('I scroll down through the feed');
    await driver.sleep(2000);

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Message number 1a")',
        6000,
      ),
      'I see message number 1 on the feed',
    );

    await driver.performTouchAction(
      new wd.TouchAction(driver)
        .press({x: 200, y: 700})
        .wait(60)
        .moveTo({x: 200, y: 1000})
        .release(),
    );
    t.pass('I scroll back up');

    t.end();
  });

  t.test('A message in the feed can be liked', async function(t) {
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
    t.pass('I see the Floating Action Button');
    await fab.tap();
    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    await composeTextInput.keys('Please like this message');
    const composePublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Publish Button")',
      6000,
    );
    await composePublishButton.tap();

    t.pass('I created a public message');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Please like this message")',
        6000,
      ),
      'I see that message on the feed',
    );

    const likeButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textContains("Please like this message")' +
        '.fromParent(new UiSelector().descriptionContains("Like Button"))',
      6000,
    );
    t.pass('I see a like button on that message');
    await likeButton.tap();
    t.pass('I tap the like button');
    await driver.sleep(1000);
    const likeCount = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textContains("Please like this message")' +
        '.fromParent(new UiSelector().descriptionContains("Like Count"))',
      6000,
    );
    const count = await likeCount.text();
    t.equals(count, '1 like', 'I see "1 like" as the counter');

    t.end();
  });
};
