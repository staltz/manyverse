// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const RECOVERY = require('./utils/recovery');

module.exports = function (driver, t) {
  t.test('Connections tab can create DHT invites', async function (t) {
    const connectionsTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Connections Tab Button")',
    );
    t.ok(connectionsTabButton, 'I see the Connections Tab button');
    await connectionsTabButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().text("Connections")',
      ),
      'I see the Connections header in the Central screen',
    );
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("No connections")',
      ),
      'I see Connections tab body with no connections',
    );

    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab, 'I see the Floating Action Button');

    t.end();
  });

  t.test('Connections tab changes to Public Tab', async function (t) {
    const publicTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Public Tab Button")',
    );
    t.ok(publicTabButton, 'I see Public Tab button');
    await publicTabButton.click();
    t.pass('I tap it');

    t.end();
  });
};
