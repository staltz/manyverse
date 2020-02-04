/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

module.exports = function(driver, t) {
  t.test('Central screen is displayed with 2 tabs', async function(t) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public board")',
        6000,
      ),
      'I see the Public header in the Central screen',
    );
    await driver.sleep(3000);
    // Public tab
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("No messages")',
        8000,
      ),
      'I see the Public tab body with no messages',
    );
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Public Tab Button")',
      ),
      'I see Public tab button',
    );

    // Private tab
    const privateTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Private Tab Button")',
    );
    t.ok(privateTabButton, 'I see the Private Tab button');
    await privateTabButton.click();
    t.pass('I tap it');
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().text("Private messages")',
      ),
      'I see the Private header in the Central screen',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Write a private message")',
        8000,
      ),
      'I see the Private tab body with no messages',
    );

    // Connections tab
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

    try {
      t.ok(
        await driver.elementByAndroidUIAutomator(
          'new UiSelector().textContains("No connections")',
        ),
        'I see Connections tab body with no connections',
      );
    } catch (err) {
      t.ok(
        await driver.elementByAndroidUIAutomator(
          'new UiSelector().textContains("Connecting")',
        ),
        'I see Connections tab body with no connections',
      );
    }

    const lanHelpButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Local Network Mode")',
    );
    t.ok(lanHelpButton, 'I see LAN mode icon');
    await lanHelpButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Connect with friends in the same Local Area Network")',
        6000,
      ),
      'I see a text explaining what LAN connectivity is',
    );

    const okButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("OK")',
      6000,
    );
    t.ok(okButton, 'I see the OK button');
    await okButton.click();
    t.pass('I tap it');

    // Back to Public tab
    const publicTabButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Public Tab Button")',
    );
    t.ok(publicTabButton, 'I see Public Tab button');
    await publicTabButton.click();
    t.pass('I tap it');
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public board")',
        8000,
      ),
      'I see the Public header in the Central screen',
    );

    t.end();
  });
};
