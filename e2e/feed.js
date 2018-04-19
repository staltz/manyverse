/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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
    const feedTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Feed Text Input")',
      6000,
    );
    t.pass('I see Feed Text Input');
    const f1 = await feedTextInput.text();
    const AMOUNT = 10;
    for (let i = 1; i <= AMOUNT; i++) {
      await feedTextInput.tap();
      const composeTextInput = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Text Input")',
        6000,
      );
      await composeTextInput.keys('Message number ' + i + 'a');
      const composePublishButton = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Publish Button")',
        6000,
      );
      await composePublishButton.tap();
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
    action.moveTo({x: 200, y: 800});
    action.release();
    t.pass('pre-perform touch');
    await driver.performTouchAction(action);
    t.pass('I scroll through the feed');

    t.pass(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Message number 1a")',
        6000,
      ),
      'I see message number 1 on the feed',
    );

    t.end();
  });
};
