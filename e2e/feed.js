/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const wd = require('wd');

async function scrollDownUntil(driver, conditionFn) {
  for (let _ of Array(10)) {
    let action = new wd.TouchAction(driver);
    action
      .press({x: 600, y: 1100})
      .wait(200)
      .moveTo({x: 600, y: 600})
      .release();
    await action.perform();
    await driver.sleep(300);
    if (await conditionFn()) return;
  }
}

async function scrollUpUntil(driver, conditionFn) {
  for (let _ of Array(10)) {
    let action = new wd.TouchAction(driver);
    action
      .press({x: 600, y: 600})
      .wait(200)
      .moveTo({x: 600, y: 1100})
      .release();
    await action.perform();
    await driver.sleep(300);
    if (await conditionFn()) return;
  }
}

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
    await chevron.click();
    t.pass('I tap it');

    const menuItem = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("View raw message")',
      6000,
    );
    t.ok(menuItem, 'I see a menu with an option "View raw message"');
    await menuItem.click();
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
    const fab1 = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab1, 'I see the Floating Action Button');

    const AMOUNT = 10;
    t.pass('I begin creating ' + AMOUNT + ' public messages');
    for (let i = 1; i <= AMOUNT; i++) {
      const fab = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Floating Action Button")',
        6000,
      );
      await fab.click();
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
      await composePublishButton.click();
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

    await scrollDownUntil(driver, async () => {
      try {
        return !!(await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().textContains("Message number 1a")',
          1000,
        ));
      } catch (err) {
        return false;
      }
    });
    t.pass('I scroll down through the feed');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Message number 1a")',
        6000,
      ),
      'I see message number 1 on the feed',
    );

    await scrollUpUntil(driver, async () => {
      try {
        return !!(await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().textContains("Message number ' + AMOUNT + 'a")',
          1000,
        ));
      } catch (err) {
        return false;
      }
    });
    t.pass('I scroll back up');

    t.end();
  });

  t.skip('(TODO) Feed displays follows and blocks', async function(t) {
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
    t.ok(fab, 'I see the Floating Action Button');
    await fab.click();
    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    await composeTextInput.keys('Please like this message');
    const composePublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Publish Button")',
      6000,
    );
    await composePublishButton.click();

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
    t.ok(likeButton, 'I see a like button on that message');
    await likeButton.click();
    t.pass('I tap the like button');

    await driver.sleep(1000);
    const likeCount = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textContains("Please like this message")' +
        '.fromParent(' +
        'new UiSelector().descriptionContains("Like Count Button")' +
        '.childSelector(new UiSelector().textContains("like"))' +
        ')',
      6000,
    );
    const count = await likeCount.text();
    t.equals(count, '1 like', 'I see "1 like" as the counter');

    t.end();
  });

  t.test('I can see that someone has liked a message in the Accounts screen', async function(t) {
    const likeCount = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textContains("Please like this message")' +
        '.fromParent(' +
        'new UiSelector().descriptionContains("Like Count Button")' +
        ')',
      6000,
    );
    t.pass('I see the like count');

    await likeCount.click();
    t.pass('I tap it')

    const likeList = await driver.waitForElementsByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Link To Account")',
      6000,
    )
    t.equals(likeList.length, 1, 'I see 1 person having liked the message');

    await driver.back();
    t.pass('I press the (hardware) back button');

    t.end();
  })
};
