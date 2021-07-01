/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

module.exports = function (driver, t) {
  t.test('Compose screen allows posting new public message', async function (
    t,
  ) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Public header in the Central screen',
    );

    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab, 'I see the Floating Action Button');
    await fab.click();
    t.pass('I tap it');

    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput, 'I see the Compose Text Input in Compose screen');

    await composeTextInput.keys('Hello world today is a sunny day');
    t.pass('I type a message into it');
    const f2 = await composeTextInput.text();
    t.equal(f2.length, 32, 'Its text content is non-empty');

    const openCameraButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Open Camera Button")',
      6000,
    );
    t.ok(openCameraButton, 'I see the Open Camera Button');

    const addPictureButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Add Picture Button")',
      6000,
    );
    t.ok(addPictureButton, 'I see the Add Picture Button');

    const composePublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Publish Message Button")',
      6000,
    );
    t.ok(composePublishButton, 'I see the Publish Message Button');
    await composePublishButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Hello world today is a sunny day")',
        6000,
      ),
      'I see the new message posted on the feed',
    );

    t.end();
  });

  t.test('Compose screen supports adding a content warning', async (t) => {
    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab, 'I see the Floating Action Button');
    await fab.click();
    t.pass('I tap it');

    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput, 'I see the Compose Text Input in Compose screen');

    await composeTextInput.keys('Goodbye world today is a dark day');
    t.pass('I type a message into it');
    const f2 = await composeTextInput.text();
    t.equal(f2.length, 33, 'Its text content is non-empty');

    const contentWarningButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Content Warning Button")',
      6000,
    );
    t.ok(contentWarningButton, 'I see the Content Warning Button');
    await contentWarningButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("If your post contains sensitive topics")',
      ),
      'I see a dialog prompt asking for the note',
    );
    t.pass('I write a note into the text field');
    await driver.keys('depressing message');

    await driver.sleep(1000);
    const doneButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textMatches("(Done|DONE)")',
      6000,
    );
    t.ok(doneButton, 'I see the Done button');
    await doneButton.click();
    t.pass('I tap it');

    const openCameraButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Open Camera Button")',
      6000,
    );
    t.ok(openCameraButton, 'I see the Open Camera Button');
    await openCameraButton.click();
    t.pass('I tap it');

    await driver.sleep(2000);
    const captureButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Capture photo")',
      6000,
    );
    t.ok(captureButton, 'I see the Capture photo Button');
    await captureButton.click();
    t.pass('I tap it');
    await driver.sleep(5000);

    const captureDoneButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Done")',
      6000,
    );
    t.ok(captureDoneButton, 'I see the Capture done Button');
    await captureDoneButton.click();
    t.pass('I tap it');
    await driver.sleep(2000);

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Add some description of this picture")',
      ),
      'I see a dialog prompt asking for a caption',
    );
    t.pass('I write a caption into the text field');
    await driver.keys('serendipitous');

    await driver.sleep(1000);
    const doneButton2 = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textMatches("(Done|DONE)")',
      6000,
    );
    t.ok(doneButton2, 'I see the Done button');
    await doneButton2.click();
    t.pass('I tap it');

    const composePublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Publish Message Button")',
      6000,
    );
    t.ok(composePublishButton, 'I see the Publish Message Button');
    await composePublishButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("depressing message")',
        6000,
      ),
      'I see the content warning replacing the message on the feed',
    );

    try {
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Goodbye world today is a dark day")',
        1000,
      );
      t.fail('Should not have seen content-warning-protected message');
    } catch (err) {
      t.pass('I dont see the content-warned message on the Central screen');
    }

    try {
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("serendipitous")',
        1000,
      );
      t.fail('Should not have seen the content-warning-protected picture');
    } catch (err) {
      t.pass('I dont see the content-warned picture on the Central screen');
    }

    const viewButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().text("View")',
      6000,
    );
    t.ok(viewButton, 'I see the View Button');
    await viewButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Reply Text Input")',
        6000,
      ),
      'I am on the Thread screen',
    );

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Goodbye world today is a dark day")',
        6000,
      ),
      'I see the actual content-warned message in the Thread',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("serendipitous")',
        6000,
      ),
      'I see the actual content-warned picture in the Thread',
    );

    const hideButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().text("Hide")',
      6000,
    );
    t.ok(hideButton, 'I see the Hide Button');
    await hideButton.click();
    t.pass('I tap it');

    try {
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Goodbye world today is a dark day")',
        1000,
      );
      t.fail('Should not have seen content-warning-protected message');
    } catch (err) {
      t.pass('I dont see the content-warned message on the Thread screen');
    }

    await driver.back();
    t.pass('I press the (hardware) back button');

    t.end();
  });

  t.skip(
    '(TODO) Compose screen allows previewing the markdown',
    async function (t) {
      t.end();
    },
  );

  t.test('Compose screen does not close when keyboard closes', async function (
    t,
  ) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Public header in the Central screen',
    );

    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab, 'I see Floating Action Button');
    await fab.click();
    t.pass('I tap it');
    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Text Input")',
        6000,
      ),
      'I see the Compose Text Input in Compose screen',
    );
    await driver.hideKeyboard();
    t.pass('I hide the keyboard');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Text Input")',
        6000,
      ),
      'I still see the Compose Text Input in Compose screen',
    );

    t.end();
  });

  t.test('Compose screen auto-saves draft', async function (t) {
    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput, 'I see the Compose Text Input in Compose screen');
    await composeTextInput.keys('color of my shirt is green');
    t.pass('I type a partial message into it');
    const f = await composeTextInput.text();
    t.equal(f.length, 26, 'Its text content is non-empty');

    const closeButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Close Button")',
      6000,
    );
    t.ok(closeButton, 'I see the Close Button');
    await closeButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Central screen',
    );

    const fab = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Floating Action Button")',
      6000,
    );
    t.ok(fab, 'I see the Floating Action Button');
    await fab.click();
    t.pass('I tap it');

    const composeTextInput2 = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput2, 'I see the Compose Text Input in Compose screen');
    const f2 = await composeTextInput2.text();
    t.equal(f2, 'color of my shirt is green', 'I see the saved draft text');

    const composePublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Publish Message Button")',
      6000,
    );
    t.ok(composePublishButton, 'I see the Publish Message Button');
    await composePublishButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public posts")',
        6000,
      ),
      'I see the Central screen',
    );

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("color of my shirt is green")',
        6000,
      ),
      'I see the new message posted on the feed',
    );

    t.end();
  });
};
