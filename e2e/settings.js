// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const wd = require('wd');
const RECOVERY = require('./utils/recovery');

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

module.exports = function (driver, t) {
  t.test('Settings screen shows toggle for follows', async function (t) {
    await driver.sleep(3000);

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Show follow or block or unfollow cases")',
        6000,
      ),
      'I see the Show follow events toggle option',
    );
    t.end();
  });

  t.test('Settings screen shows toggle for detailed logs', async function (t) {
    await scrollDownUntil(driver, async () => {
      try {
        return !!(await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().textContains("Enable detailed logs")',
          1000,
        ));
      } catch (err) {
        return false;
      }
    });
    t.pass('I scroll down');

    const detailedLogs = await driver.elementByAndroidUIAutomator(
      'new UiSelector().textContains("Enable detailed logs")',
    );
    t.ok(detailedLogs, 'I see the Enable Detailed Logs switch');
    await detailedLogs.click();
    t.pass('I toggle it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Restart required")',
        6000,
      ),
      'I see a popup explaining that a restart is required',
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

  t.test('Settings screen can show the About modal', async function (t) {
    await scrollDownUntil(driver, async () => {
      try {
        return !!(await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().descriptionContains("About This App")',
          1000,
        ));
      } catch (err) {
        return false;
      }
    });
    t.pass('I scroll down');

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

  t.test('Settings screen shows a Backup option', async function (t) {
    await scrollUpUntil(driver, async () => {
      try {
        return !!(await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().descriptionContains("Back Up My Account")',
          1000,
        ));
      } catch (err) {
        return false;
      }
    });
    t.pass('I scroll up');

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
      'new UiSelector().descriptionContains("Continue")',
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
      'new UiSelector().descriptionContains("Acknowledge")',
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
      'new UiSelector().descriptionContains("Show Recovery Phrase")',
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
    t.equals(actual, RECOVERY.words24.join(' '), 'There are 24 words');

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
    t.pass('I type my 48 words (old compatibility mode) into it');
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

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Central screen and the Public tab',
    );

    t.end();
  });
};
