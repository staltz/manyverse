/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const test = require('tape');
const wd = require('wd');

module.exports = function(driver, t) {
  t.test('Profile screen of self is accessible from menu', async function(t) {
    // Go to my profile
    const pressMenu = new wd.TouchAction(driver);
    pressMenu.press({x: 80, y: 150});
    pressMenu.wait(20);
    pressMenu.release();
    await driver.performTouchAction(pressMenu);
    t.pass('I press the Menu (top left corner)');
    const myProfileButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("My Profile Menu Item")',
    );
    t.ok(myProfileButton, 'I see My Profile Button');
    await myProfileButton.tap();
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
    let noMyProfileButton;
    try {
      noMyProfileButton = await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("My Profile Button")',
        1000,
      );
      t.fail('Should not have seen My Profile Button belonging to Central');
    } catch (err) {
      t.pass('I dont see anything from the Central screen anymore');
    }

    t.end();
  });

  t.test('Edit Profile screen can edit name/description', async function(t) {
    // Press edit
    const editProfileButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Edit Profile Button")',
    );
    t.ok(editProfileButton, 'I see Edit Profile Button');
    await editProfileButton.tap();
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
      'new UiSelector().descriptionContains("Description Text Input")',
    );
    t.ok(editDescription, 'I see Description Text Input');
    await editDescription.tap();
    t.pass('I tap it');
    await editDescription.sendKeys('teacher');
    t.pass('I type "teacher" into it');

    // Press save
    const saveProfileButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Save Profile Button")',
    );
    t.ok(saveProfileButton, 'I see Save Profile Button');
    await saveProfileButton.tap();
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

    // Read the description
    const profileDescription = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Profile Description")' +
        '.childSelector(new UiSelector().textContains("teacher"))',
    );
    t.ok(profileDescription, 'I see Profile Description');
    const description = await profileDescription.text();
    t.equal(description, 'teacher', 'I see the description with: "teacher"');

    t.end();
  });
};
