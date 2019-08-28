/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

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
    await aboutButton.click();
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
