/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const wd = require('wd');

module.exports = function (driver, t) {
  t.test('Profile screen of self is accessible from menu', async function (t) {
    // Go to my profile
    const pressMenu = new wd.TouchAction(driver);
    pressMenu.press({x: 80, y: 150});
    pressMenu.release();
    await driver.performTouchAction(pressMenu);
    t.pass('I press the Menu (top left corner)');
    const myProfileButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("My Profile")',
    );
    t.ok(myProfileButton, 'I see My Profile Button');
    await myProfileButton.click();
    t.pass('I tap it');

    // Read the name
    const profileName = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Profile Name")',
      1000,
    );
    t.ok(profileName, 'I see Profile Name');
    const name = await profileName.text();
    t.equal(name[0], '@', 'I see that the name starts with @');

    // Dont see "go to profile" button
    try {
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("My Profile")',
        1000,
      );
      t.fail('Should not have seen My Profile Button belonging to Central');
    } catch (err) {
      t.pass('I dont see anything from the Central screen anymore');
    }

    t.end();
  });

  t.skip(
    '(TODO) Profile screen cannot navigate to same profile',
    async function (t) {
      t.end();
    },
  );

  t.skip('(TODO) Profile screen allows profile to be blocked', async function (
    t,
  ) {
    t.end();
  });

  t.test('Profile screen shows messages with Etc button', async function (t) {
    const chevron = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Etc Button")',
      6000,
    );
    t.ok(chevron, 'I see the Etc Button on a message');
    await chevron.click();
    t.pass('I tap it');

    const menuItem = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().text("View raw message")',
      6000,
    );
    t.ok(menuItem, 'I see a menu with an option "View raw message"');
    await menuItem.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Raw message")',
        6000,
      ),
      'I see the Raw Message screen',
    );

    await driver.back();
    t.pass('I press the (hardware) back button');

    t.end();
  });

  t.test('Edit Profile screen can edit name/description', async function (t) {
    // Press edit
    const editProfileButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Edit Profile Button")',
    );
    t.ok(editProfileButton, 'I see Edit Profile Button');
    await editProfileButton.click();
    t.pass('I tap it');

    // Edit name
    const editName = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Name Text Input").focused(true)',
    );
    t.ok(editName, 'I see Name Text Input and it is focused already');
    const e1 = await editName.text();
    t.true(e1.length === 0, 'Its text content is empty');
    await editName.keys('maria');
    t.pass('I type "maria" into it');

    // Edit description
    const editDescription = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Biography Text Input")',
    );
    t.ok(editDescription, 'I see Biography Text Input');
    await editDescription.click();
    t.pass('I tap it');
    await editDescription.sendKeys('teacher');
    t.pass('I type "teacher" into it');

    // Edit avatar
    const editAvatar = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Edit Profile Picture")',
    );
    t.ok(editAvatar, 'I see the Profile Picture');
    await editAvatar.click();
    t.pass('I tap it');
    await driver.sleep(1000);
    const galleryCameraOrRecent = await driver.elementByAndroidUIAutomator(
      'new UiSelector().textMatches("(Camera|Recent)")',
    );
    t.ok(galleryCameraOrRecent, 'I see the Android Picture Gallery');
    await driver.back();
    t.pass('I press the (hardware) back button');

    // Press save
    const saveProfileButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Save Profile")',
    );
    t.ok(saveProfileButton, 'I see Save Profile Button');
    await saveProfileButton.click();
    t.pass('I tap it');

    t.pass('I wait a bit (3 seconds)');
    await driver.sleep(3000);

    // Read the name
    const profileName = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Profile Name")',
    );
    t.ok(profileName, 'I see Profile Name');
    const name2 = await profileName.text();
    t.equal(name2, 'maria', 'I see the name: "maria"');
    t.end();
  });

  t.test('Profile screen leads to Bio screen', async function (t) {
    // Press edit
    const editProfileButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Show Biography")',
    );
    t.ok(editProfileButton, 'I see the Biography Button');
    await editProfileButton.click();
    t.pass('I tap it');

    // Read the description
    const profileDescription = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Biographic Description")' +
        '.childSelector(new UiSelector().textContains("teacher"))',
    );
    t.ok(profileDescription, 'I see the Description in the Biography Screen');
    const description = await profileDescription.text();
    t.equal(description, 'teacher', 'I see the description with: "teacher"');

    t.end();
  });
};
