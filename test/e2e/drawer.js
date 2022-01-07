// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const wd = require('wd');
const RECOVERY = require('./utils/recovery');

module.exports = function (driver, t) {
  t.test('Drawer has some menu items', async function (t) {
    await driver.sleep(2000);
    // Open drawer
    const pressMenu = new wd.TouchAction(driver);
    pressMenu.press({x: 80, y: 150});
    pressMenu.release();
    await driver.performTouchAction(pressMenu);
    t.pass('I press the Menu (top left corner)');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("My Profile")',
      ),
      'I see "My profile"',
    );

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Show Raw Database")',
      ),
      'I see "Raw database"',
    );

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Send Bug Report as Email")',
      ),
      'I see "Email bug report"',
    );

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Go To Settings")',
      ),
      'I see "Settings"',
    );
    t.end();
  });

  t.test("Drawer shows user's id", async function (t) {
    const partOfId = RECOVERY.id.substr(0, 10);

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("' + partOfId + '")',
        6000,
      ),
      'I see my user id on the drawer',
    );

    t.end();
  });

  t.test('Drawer can be hidden by sliding', async function (t) {
    await driver.sleep(2000);
    // Open drawer
    const pressMenu = new wd.TouchAction(driver);
    pressMenu.press({x: 80, y: 150});
    pressMenu.wait(20);
    pressMenu.release();
    await driver.performTouchAction(pressMenu);
    t.pass('I open the drawer');

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
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Central screen and the Public tab',
    );

    t.end();
  });

  t.test('Drawer has a link to the Settings screen', async function (t) {
    await driver.sleep(2000);
    // Open drawer
    const pressMenu = new wd.TouchAction(driver);
    pressMenu.press({x: 80, y: 150});
    pressMenu.release();
    await driver.performTouchAction(pressMenu);
    t.pass('I open the drawer');

    const aboutButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Go To Settings")',
    );
    await aboutButton.click();
    t.pass('I tap the Settings button');

    t.end();
  });
};
