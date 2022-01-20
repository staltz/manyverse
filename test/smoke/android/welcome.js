// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

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
    const title = 'Off the grid';
    const titleAlt = 'Off-the-grid';
    const desc = 'Manyverse can use internet connectivity';
    t.ok(
      await Promise.race([
        driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().text("' + title + '")',
          6000,
        ),
        driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().text("' + titleAlt + '")',
          6000,
        ),
      ]),
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

    const createAccountButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Create Account Button")',
    );
    t.ok(createAccountButton, 'I see the Create Account button');
    await createAccountButton.click();
    t.pass('I tap it');

    t.end();
  });
};
