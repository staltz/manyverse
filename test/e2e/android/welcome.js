// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const RECOVERY = require('./utils/recovery');

module.exports = function (driver, t) {
  t.test('Welcome screen displays the initial tutorial', async function (t) {
    await driver.sleep(3000);

    const title = 'Welcome to Manyverse!';
    const desc = 'Social networking can be simple';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the first title in the Welcome screen',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("' + desc + '")',
        6000,
      ),
      'I see the first description in the Welcome sceren',
    );
    const continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the off grid tutorial', async function (t) {
    const title = 'Off-the-grid';
    const desc = 'Manyverse can use internet connectivity';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the second title in the Welcome screen',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("' + desc + '")',
        6000,
      ),
      'I see the second description in the Welcome sceren',
    );
    const continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the multimodal tutorial', async function (t) {
    const title = 'Many ways to connect';
    const desc = 'To connect with friends nearby and synchronize content';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the third title in the Welcome screen',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("' + desc + '")',
        6000,
      ),
      'I see the third description in the Welcome sceren',
    );
    const continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the moderation tutorial', async function (t) {
    const title = 'Shared moderation';
    const desc = 'Because your device holds your social network';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the forth title in the Welcome screen',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("' + desc + '")',
        6000,
      ),
      'I see the forth description in the Welcome sceren',
    );
    const continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the permanence tutorial', async function (t) {
    const title = 'Permanence';
    const desc = 'Once your content is synchronized with friends';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the fifth title in the Welcome screen',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("' + desc + '")',
        6000,
      ),
      'I see the fifth description in the Welcome sceren',
    );
    const continueButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Continue")',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test(
    'Welcome screen displays the work-in-progress tutorial',
    async function (t) {
      const title = 'In construction!';
      const desc = 'Manyverse is beta-quality software';
      t.ok(
        await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().text("' + title + '")',
          6000,
        ),
        'I see the sixth title in the Welcome screen',
      );
      t.ok(
        await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().textContains("' + desc + '")',
          6000,
        ),
        'I see the sixth description in the Welcome sceren',
      );
      const continueButton = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Continue")',
      );
      t.ok(continueButton, 'I see the Continue button');
      await continueButton.click();
      t.pass('I tap it');

      t.end();
    },
  );

  t.test('Welcome screen displays the account prompt', async function (t) {
    const title = 'Is this your first time?';
    const desc = 'Do you want to create a new account';
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("' + title + '")',
        6000,
      ),
      'I see the account prompt title in the Welcome screen',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("' + desc + '")',
        6000,
      ),
      'I see the account prompt description in the Welcome sceren',
    );

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Create Account Button")',
      ),
      'I see the Create Account button',
    );

    t.end();
  });

  t.test('Create a new account', async function (t) {
    const createAccountButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Create Account Button")',
    );
    t.ok(createAccountButton, 'I see the Create Account button');
    await createAccountButton.click();
    t.pass('I tap it');

    t.end();
  });

  /**
   * This is skipped because it's not possible to test the account recovery
   * since the recovered feed is actually empty (it never published anything).
   * Consider this "commented code", useful in the future in case we want to
   * e2e test account recovery.
   */
  t.skip('Secret input screen asks for recovery phrase', async function (t) {
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

    const secretInputField = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Recovery Phrase Text Input")',
      6000,
    );
    t.ok(
      secretInputField,
      'I see the Recovery Phrase Text Input in Secret Input screen',
    );

    await secretInputField.keys(RECOVERY.words24.join(' '));
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

    t.end();
  });
};
