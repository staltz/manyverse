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
  t.test('Drawer has some menu items', async function(t) {
    // Open drawer
    const pressMenu = new wd.TouchAction(driver);
    pressMenu.press({x: 80, y: 150});
    pressMenu.wait(20);
    pressMenu.release();
    await driver.performTouchAction(pressMenu);
    t.pass('I press the Menu (top left corner)');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("My Profile Menu Item")',
      ),
      'I see "My profile"',
    );

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Email Bug Report")',
      ),
      'I see "Email bug report"',
    );

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Show Raw Database")',
      ),
      'I see "Raw database"',
    );

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("About This App")',
      ),
      'I see "About Manyverse"',
    );
    t.end();
  });

  t.test('Drawer can show About modal', async function(t) {
    const aboutButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("About This App")',
    );
    await aboutButton.tap();
    t.pass('I tap the About button');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("A social network off the grid")',
        6000,
      ),
      'I see a textual description of the app',
    );

    await driver.back();
    t.pass('I press the (hardware) back button');

    t.end();
  });

  t.test('Drawer can be hidden by sliding', async function(t) {
    // Slide drawer out of view
    const slideToLeft = new wd.TouchAction(driver);
    slideToLeft.press({x: 300, y: 500});
    slideToLeft.wait(60);
    slideToLeft.moveTo({x: 50, y: 500});
    slideToLeft.release();
    await driver.performTouchAction(slideToLeft);
    t.pass('I slide the drawer out of view');

    await driver.sleep(1000);

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Messages")',
        6000,
      ),
      'I see the Central screen and the Messages tab',
    );

    t.end();
  });
};
