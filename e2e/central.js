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

module.exports = function(driver, t) {
  t.test('Central screen is displayed with 4 tabs', async function(t) {
    // Public tab
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Feed Text Input")',
        6000,
      ),
      'I see Feed Text Input',
    );
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Public Tab Button")',
      ),
      'I see Public tab button',
    );

    // Private tab
    const privateTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Private Tab Button")',
    );
    t.ok(privateTabButton, 'I see Private Tab button');
    await privateTabButton.tap();
    t.pass('I tap it');
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Private")',
      ),
      'I see Private tab body',
    );
    let noFeedTextInput;
    try {
      noFeedTextInput = await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Feed Text Input")',
        1000,
      );
      t.fail('Should not have seen Feed Text Input (from public tab)');
    } catch (err) {
      t.pass('I dont see Feed Text Input (from public tab)');
    }

    // Notifications tab
    const notificationsTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Notifications Tab Button")',
    );
    t.ok(notificationsTabButton, 'I see Notifications Tab button');
    await notificationsTabButton.tap();
    t.pass('I tap it');
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Notifications")',
      ),
      'I see Notifications tab body',
    );

    // Sync tab
    const syncTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Sync Tab Button")',
    );
    t.ok(syncTabButton, 'I see Sync Tab button');
    await syncTabButton.tap();
    t.pass('I tap it');
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Peers around you")',
      ),
      'I see Sync tab body',
    );

    t.end();
  });
};
