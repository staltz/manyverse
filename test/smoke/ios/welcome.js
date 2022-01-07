// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

module.exports = function (driver, t) {
  t.test('Welcome screen displays the initial tutorial', async function (t) {
    await driver.sleep(3000);

    const title = 'Welcome to Manyverse!';
    const desc = 'Social networking can be simple';
    const order = 'first';

    await driver.sleep(2000);
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label == "' + title + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} title in the Welcome screen`,
    );
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label BEGINSWITH "' + desc + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} description in the Welcome sceren`,
    );
    const continueButton = await driver.elementByIosClassChain(
      '**/*[`label == "Continue" AND visible == 1`][1]',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the off grid tutorial', async function (t) {
    const title = 'Off the grid';
    const desc = 'Manyverse can use internet connectivity';
    const order = 'second';

    await driver.sleep(2000);
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label == "' + title + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} title in the Welcome screen`,
    );
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label BEGINSWITH "' + desc + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} description in the Welcome sceren`,
    );
    const continueButton = await driver.elementByIosClassChain(
      '**/*[`label == "Continue" AND visible == 1`][1]',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the multimodal tutorial', async function (t) {
    const title = 'Many ways to connect';
    const desc = 'To connect with friends nearby and synchronize content';
    const order = 'third';

    await driver.sleep(2000);
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label == "' + title + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} title in the Welcome screen`,
    );
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label BEGINSWITH "' + desc + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} description in the Welcome sceren`,
    );
    const continueButton = await driver.elementByIosClassChain(
      '**/*[`label == "Continue" AND visible == 1`][1]',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the moderation tutorial', async function (t) {
    const title = 'Shared moderation';
    const desc = 'Because your device holds your social network';
    const order = 'fourth';

    await driver.sleep(2000);
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label == "' + title + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} title in the Welcome screen`,
    );
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label BEGINSWITH "' + desc + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} description in the Welcome sceren`,
    );
    const continueButton = await driver.elementByIosClassChain(
      '**/*[`label == "Continue" AND visible == 1`][1]',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the permanence tutorial', async function (t) {
    const title = 'Permanence';
    const desc = 'Once your content is synchronized with friends';
    const order = 'fifth';

    await driver.sleep(2000);
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label == "' + title + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} title in the Welcome screen`,
    );
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label BEGINSWITH "' + desc + '" AND visible == 1`][1]',
        6000,
      ),
      `I see the ${order} description in the Welcome sceren`,
    );
    const continueButton = await driver.elementByIosClassChain(
      '**/*[`label == "Continue" AND visible == 1`][1]',
    );
    t.ok(continueButton, 'I see the Continue button');
    await continueButton.click();
    t.pass('I tap it');

    t.end();
  });

  t.test('Welcome screen displays the account prompt', async function (t) {
    const title = 'Is this your first time?';
    const desc = 'Do you want to create a new account';

    await driver.sleep(2000);
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label == "' + title + '" AND visible == 1`][1]',
        6000,
      ),
      'I see the account prompt title in the Welcome screen',
    );
    t.ok(
      await driver.waitForElementByIosClassChain(
        '**/*[`label BEGINSWITH "' + desc + '" AND visible == 1`][1]',
        6000,
      ),
      'I see the account prompt description in the Welcome sceren',
    );

    await driver.sleep(2000);
    const createAccountButton = await driver.elementByIosClassChain(
      '**/*[`name BEGINSWITH "Create Account Button" AND visible == 1`][1]',
    );
    t.ok(createAccountButton, 'I see the Create Account button');
    await createAccountButton.click();
    t.pass('I tap it');

    t.end();
  });
};
