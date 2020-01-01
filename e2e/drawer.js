/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const wd = require('wd');
const RECOVERY = require('./utils/recovery');

module.exports = function(driver, t) {
  t.test('Drawer has some menu items', async function(t) {
    await driver.sleep(2000);
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

  t.test("Drawer shows user's id", async function(t) {
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

  t.test('Drawer can show About modal', async function(t) {
    const aboutButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("About This App")',
    );
    await aboutButton.click();
    t.pass('I tap the About button');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Licensed MPL")',
        6000,
      ),
      'I see a textual description of the app',
    );

    const okButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("OK")',
      6000,
    );
    t.ok(okButton, 'I see the OK button');
    await okButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Backup screen can be accessed from the drawer', async function(t) {
    const backupButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Back Up My Account")',
    );
    await backupButton.click();
    t.pass('I tap the Backup button');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Your account has")',
        6000,
      ),
      'I see the first title in the Backup screen',
    );
    const continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue Button")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Data")',
        6000,
      ),
      'I see the second title in the Backup screen',
    );
    const iUnderstandButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("I understand Button")',
    );
    t.ok(iUnderstandButton, 'I see the I Understand button');
    await iUnderstandButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Identity")',
        6000,
      ),
      'I see the third title in the Backup screen',
    );

    const showRecoveryButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Show Recovery Phrase Button")',
    );
    t.ok(showRecoveryButton, 'I see the Show Recovery Phrase button');
    await showRecoveryButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("CAREFULLY WRITE DOWN THE FOLLOWING RECOVERY PHRASE")',
        6000,
      ),
      'I see the disclaimer on the Secret Output screen',
    );

    const secretWords = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Secret Words")',
    );
    t.ok(secretWords, 'I see the Secret Words');
    const actual = await secretWords.text();
    t.equals(actual, RECOVERY.words.join(' '), 'There are 48 words');

    const confirmRecoveryButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Confirm Recovery Phrase Button")',
    );
    t.ok(confirmRecoveryButton, 'I see the Confirm Recovery Phrase button');
    await confirmRecoveryButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("CAREFULLY INPUT YOUR RECOVERY PHRASE")',
        6000,
      ),
      'I see the Secret Input screen',
    );

    const secretInputField = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Recovery Phrase Text Input")',
      6000,
    );
    t.ok(
      secretInputField,
      'I see the Recovery Phrase Text Input in Secret Input screen',
    );

    await secretInputField.keys(RECOVERY.words.join(' '));
    t.pass('I type my 48 words into it');
    const f2 = await secretInputField.text();
    t.equal(f2.split(' ').length, 48, 'Its text content now has 48 words');

    const confirmButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Confirm Recovery Phrase Button")',
    );
    t.ok(confirmButton, 'I see the Confirm button');
    await confirmButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Correct!")',
        6000,
      ),
      'I see an alert saying that I succeeded in writing my words',
    );

    const okButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("OK")',
      6000,
    );
    t.ok(okButton, 'I see the OK button');
    await okButton.click();
    t.pass('I tap it');

    t.pass('I go back to Central screen');
    t.end();
  });

  t.test('Drawer can be hidden by sliding', async function(t) {
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
        'new UiSelector().text("Messages")',
        6000,
      ),
      'I see the Central screen and the Messages tab',
    );

    t.end();
  });
};
