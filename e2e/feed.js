/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const test = require('tape');
const wd = require('wd');

module.exports = function(driver, t) {
  t.test('Central screen shows many in scrolling feed', async function(t) {
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
      ),
      'I see the Messages header in the Central screen',
    );
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
