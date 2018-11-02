/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const test = require('tape');

module.exports = function(driver, t) {
  t.test('Connections tab can create DHT invites', async function(t) {
    const connectionsTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Connections Tab Button")',
    );
    t.ok(connectionsTabButton, 'I see the Connections Tab button');
    await connectionsTabButton.tap();
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
    await fab.tap();
    t.pass('I tap it');

    const createInviteButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().textContains("Create invite")',
      6000,
    );
    t.ok(createInviteButton, 'I see the Create Invite Button');
    await createInviteButton.tap();
    t.pass('I tap it');

    const inviteCode = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Invite Code")',
      6000,
    );
    const inviteCodeText = await inviteCode.text();
    t.ok(inviteCodeText.length > 70, 'I see the Invite Code');

    await driver.back();
    t.pass('I press the (hardware) back button');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Internet P2P: waiting for online friend")',
      ),
      'I see Connections tab body with a staged connection',
    );

    t.ok(
      await driver.elementByAndroidUIAutomator(
        `new UiSelector().textContains("${inviteCodeText.substr(4, 10)}")`,
      ),
      'I see that the staged connection refers to the invite code',
    );

    const publicTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Public Tab Button")',
    );
    t.ok(publicTabButton, 'I see Public Tab button');
    await publicTabButton.tap();
    t.pass('I tap it');

    t.end();
  });
};
