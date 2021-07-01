/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const fs = require('fs');
const wd = require('wd');
const mnemonic = require('ssb-keys-mnemonic-neon');

async function scrollUpUntil(driver, conditionFn) {
  for (let _ of Array(10e3)) {
    let action = new wd.TouchAction(driver);
    action
      .press({x: 600, y: 300})
      .wait(200)
      .moveTo({x: 600, y: 1300})
      .release();
    await action.perform();
    await driver.sleep(2000);
    if (await conditionFn()) return;
  }
}

module.exports = function (driver, t) {
  t.test('Initial sync with a LAN peer', async function (t) {
    await driver.sleep(3000);

    var title = 'Welcome to Manyverse!';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the first title in the Welcome screen',
    );
    var continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    var title = 'Off the grid';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the second title in the Welcome screen',
    );
    var continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    var title = 'Many ways to connect';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the third title in the Welcome screen',
    );
    var continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    var title = 'Shared moderation';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the forth title in the Welcome screen',
    );
    var continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    var title = 'Permanence';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the fifth title in the Welcome screen',
    );
    var continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    var title = 'In construction!';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the sixth title in the Welcome screen',
    );
    var continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    var title = 'Is this your first time?';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the account prompt title in the Welcome screen',
    );

    const restoreAccountButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Restore Account Button")',
    );
    t.ok(restoreAccountButton, 'I see the Restore Account button');
    await restoreAccountButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("CAREFULLY INPUT YOUR RECOVERY PHRASE")',
        6000,
      ),
      'I see the Secret Input screen',
    );

    // Load 24 words from `./data/secret-b`
    const secretB = JSON.parse(
      fs.readFileSync(__dirname + '/sync-server/data/secret-b', 'utf-8'),
    );
    const words24 = mnemonic.keysToWords(secretB);
    t.pass('I loaded 24 words from ./data/secret-b');

    const secretInputField = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Recovery Phrase Text Input")',
      6000,
    );
    t.ok(
      secretInputField,
      'I see the Recovery Phrase Text Input in Secret Input screen',
    );

    await secretInputField.keys(words24);
    t.pass('I type my 24 words into it');
    const f2 = await secretInputField.text();
    t.equal(f2.split(' ').length, 24, 'Its text content now has 24 words');

    const confirmButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Confirm Recovery Phrase Button")',
    );
    t.ok(confirmButton, 'I see the Confirm button');
    await confirmButton.click();
    t.pass('I tap it');

    await driver.sleep(2000);
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("now restored")',
        6000,
      ),
      'I see an alert saying that recovery succeeded',
    );
    await driver.sleep(2000);

    const okButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("OK")',
      6000,
    );
    t.ok(okButton, 'I see the OK button');
    await okButton.click();
    t.pass('I tap it');

    // Try clicking again, because for some reason we get hiccups sometimes
    try {
      const ok2Button = await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("OK")',
        6000,
      );
      if (ok2Button) await ok2Button.click();
    } catch (err) {}

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Public header in the Central screen',
    );
    await driver.sleep(3000);

    const before = Date.now();

    const publicTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Public Tab Button")',
    );
    t.ok(publicTabButton, 'I see Public Tab button');
    await publicTabButton.click();
    t.pass('I tap it');

    await driver.sleep(1e3);

    await scrollUpUntil(driver, async () => {
      try {
        return !!(await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().textContains("LATESTMSG")',
          1000,
        ));
      } catch (err) {
        return false;
      }
    });
    const after = Date.now();
    const duration = (after - before) / 1000;
    t.pass('Initial sync done in ' + duration.toFixed(2) + 's');
    t.comment('Initial sync done in ' + duration.toFixed(2) + 's');

    t.end();
  });
};
