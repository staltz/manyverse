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
  t.test(
    'Thread screen can be accessed from reply button in feed',
    async function(t) {
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
      t.pass('I tap the Floating Action Button');
      await fab.tap();
      const composeTextInput = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Text Input")',
        6000,
      );
      await composeTextInput.keys('Do you like dogs');
      const composePublishButton = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Publish Button")',
        6000,
      );
      await composePublishButton.tap();
      t.pass('I created a public message about dogs');

      t.ok(
        await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().textContains("Do you like dogs")',
          6000,
        ),
        'I see that message in the feed',
      );

      const replyButton = await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Do you like dogs")' +
          '.fromParent(new UiSelector().descriptionContains("Reply Button"))',
        6000,
      );
      t.pass('I see the reply button on that message');
      await replyButton.tap();
      t.pass('I tap the reply button');

      t.ok(
        await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().descriptionContains("Reply Text Input")',
          6000,
        ),
        'I see the Reply Text Input (on the Thread Screen)',
      );

      t.end();
    },
  );

  t.test('Thread screen allows adding a reply', async function(t) {
    const replyTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Text Input")',
      6000,
    );
    t.pass('I see the Reply Text Input');
    await replyTextInput.tap();
    await replyTextInput.keys('I like golden retrievers');
    const replyPublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Publish Button")',
      6000,
    );
    await replyPublishButton.tap();
    t.pass('I added a reply about dogs');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Do you like dogs")',
        6000,
      ),
      'I see the root message in the thread',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("I like golden retrievers")',
        6000,
      ),
      'I see the reply message in the thread',
    );

    t.end();
  });

  t.test('Thread screen allows going back to feed', async function(t) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Reply Text Input")',
        6000,
      ),
      'I am on the Thread screen',
    );

    await driver.back();
    t.pass('I press the (hardware) back button');
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Floating Action Button")',
        6000,
      ),
      'I am on the Central screen with a feed',
    );

    t.end();
  });
};
