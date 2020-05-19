/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

module.exports = function(driver, t) {
  t.test(
    'Thread screen can be accessed from reply button in feed',
    async function(t) {
      t.ok(
        await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().text("Public board")',
          6000,
        ),
        'I see the Public header in the Central screen',
      );
      const fab = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Floating Action Button")',
        6000,
      );
      t.pass('I tap the Floating Action Button');
      await fab.click();
      const composeTextInput = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Compose Text Input")',
        6000,
      );
      await composeTextInput.keys('Do you like dogs');
      const composePublishButton = await driver.elementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Publish Message Button")',
        6000,
      );
      await composePublishButton.click();
      t.pass('I created a public message about dogs');

      t.ok(
        await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().textContains("Do you like dogs")',
          6000,
        ),
        'I see that message in the feed',
      );

      const replyButton = await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Do you like dogs")' +
          '.fromParent(new UiSelector().descriptionContains("Reply Button"))',
        6000,
      );
      t.ok(replyButton, 'I see the reply button on that message');
      await replyButton.click();
      t.pass('I tap the reply button');

      t.ok(
        await driver.waitForElementByAndroidUIAutomator(
          'new UiSelector().descriptionContains("Reply Text Input")',
          6000,
        ),
        'I see the Reply Text Input (on the Thread Screen)',
      );

      t.end();
    },
  );

  t.test('Thread screen shows messages with Etc button', async function(t) {
    const chevron = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Etc Button")',
      6000,
    );
    t.ok(chevron, 'I see the Etc Button on a message');
    await chevron.click();
    t.pass('I tap it first to hide the keyboard');
    await chevron.click();
    t.pass('I tap it again to open the menu');

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

  t.test('Thread screen allows adding a reply', async function(t) {
    const replyTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Text Input")',
      6000,
    );
    t.ok(replyTextInput, 'I see the Reply Text Input');
    await replyTextInput.click();
    await replyTextInput.keys('I like golden retrievers');
    const replyPublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Publish Button")',
      6000,
    );
    await replyPublishButton.click();
    t.pass('I added a reply about dogs');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Do you like dogs")',
        6000,
      ),
      'I see the root message in the thread',
    );
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("I like golden retrievers")',
        6000,
      ),
      'I see the reply message in the thread',
    );

    t.end();
  });

  t.skip('(TODO) Thread screen opens for a msg cypherlink', async function(t) {
    t.end();
  });

  t.skip('(TODO) Thread screen alerts missing msg cypherlink', async function(
    t,
  ) {
    t.end();
  });

  t.skip('(TODO) Thread screen alerts blocked msg cypherlink', async function(
    t,
  ) {
    t.end();
  });

  t.test('Thread screen allows going back to feed', async function(t) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Reply Text Input")',
        6000,
      ),
      'I am on the Thread screen',
    );

    await driver.back();
    t.pass('I press the (hardware) back button');
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().descriptionContains("Floating Action Button")',
        6000,
      ),
      'I am on the Central screen with a feed',
    );

    t.end();
  });

  t.test('Thread screen allows opening full-screen Compose', async function(t) {
    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Do you like dogs")',
        6000,
      ),
      'I see the thread in the feed',
    );

    const replyButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textContains("Do you like dogs")' +
        '.fromParent(new UiSelector().descriptionContains("Reply Button"))',
      6000,
    );
    t.ok(replyButton, 'I see the reply button on that thread');
    await replyButton.click();
    t.pass('I tap it');

    const replyTextInput = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Text Input")',
      6000,
    );
    t.ok(replyTextInput, 'I see the Reply Text Input (on the Thread Screen)');
    await replyTextInput.click();
    await replyTextInput.keys('I love ');
    t.pass('I type a partial reply');

    const expandReplyButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Expand Reply Button")',
      6000,
    );
    t.ok(expandReplyButton, 'I see the Expand Reply button');
    await expandReplyButton.click();
    t.pass('I tap it');

    const composeTextInput = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Compose Text Input")',
      6000,
    );
    t.ok(composeTextInput, 'I see the Compose Text Input in Compose screen');

    const f1 = await composeTextInput.text();
    t.equal(f1.length, 7, 'Its text content is non-empty');
    await composeTextInput.keys('I love all dogs');
    t.pass('I finish typing the partial message');

    const addPictureButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Add Picture Button")',
      6000,
    );
    t.ok(addPictureButton, 'I see the Add Picture Button');

    const closeButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Close Button")',
      6000,
    );
    t.ok(closeButton, 'I see the Close Button');
    await closeButton.click();
    t.pass('I tap it');

    const replyTextInput2 = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Text Input")',
      6000,
    );
    t.ok(replyTextInput2, 'I see the Reply Text Input (on the Thread Screen)');
    const f2 = await replyTextInput2.text();
    t.equal(f2.length, 15, 'Its text content is non-empty');

    t.end();
  });

  t.test('Thread screen allows saving draft reply on exit', async function(t) {
    await driver.back();
    t.pass('I press the (hardware) back button');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Save reply draft")',
      ),
      'I see a dialog prompt asking to save the draft',
    );

    const saveButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textMatches("(Save|SAVE)")',
      6000,
    );
    t.ok(saveButton, 'I see the Save button');
    await saveButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public board")',
        6000,
      ),
      'I see the Central screen',
    );

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Do you like dogs")',
        6000,
      ),
      'I see the thread in the feed',
    );

    const replyButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textContains("Do you like dogs")' +
        '.fromParent(new UiSelector().descriptionContains("Reply Button"))',
      6000,
    );
    t.ok(replyButton, 'I see the reply button on that thread');
    await replyButton.click();
    t.pass('I tap it');

    const replyTextInput = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Text Input")',
      6000,
    );
    t.ok(replyTextInput, 'I see the Reply Text Input (on the Thread Screen)');
    const f2 = await replyTextInput.text();
    t.equal(f2.length, 15, 'Its text content is non-empty');
    t.equal(
      f2,
      'I love all dogs',
      'Its text content is what I want to publish',
    );

    const replyPublishButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Publish Button")',
      6000,
    );
    await replyPublishButton.click();
    t.pass('I published the drafted reply');

    await driver.sleep(2000);

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("I love all dogs")',
        6000,
      ),
      'I see the reply message in the thread',
    );

    t.end();
  });

  t.test('Compose screen allows deleting draft when exiting', async function(
    t,
  ) {
    const replyTextInput = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Text Input")',
      6000,
    );
    t.ok(replyTextInput, 'I see the Reply Text Input (on the Thread Screen)');
    await replyTextInput.click();
    await replyTextInput.keys('I actually hate');
    t.pass('I type a partial reply');

    const backButton = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Back Button")',
      6000,
    );
    t.ok(backButton, 'I see the back button');
    await backButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.elementByAndroidUIAutomator(
        'new UiSelector().textContains("Save reply draft")',
      ),
      'I see a dialog prompt asking to save the draft',
    );

    const deleteButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textMatches("(Delete|DELETE)")',
      6000,
    );
    t.ok(deleteButton, 'I see the Delete button');
    await deleteButton.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public board")',
        6000,
      ),
      'I see the Central screen',
    );

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("Do you like dogs")',
        6000,
      ),
      'I see the thread in the feed',
    );

    const replyButton = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().textContains("Do you like dogs")' +
        '.fromParent(new UiSelector().descriptionContains("Reply Button"))',
      6000,
    );
    t.ok(replyButton, 'I see the reply button on that thread');
    await replyButton.click();
    t.pass('I tap it');

    const replyTextInput2 = await driver.waitForElementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Reply Text Input")',
      6000,
    );
    t.ok(replyTextInput2, 'I see the Reply Text Input (on the Thread Screen)');
    replyTextInput2.click();
    const f2 = await replyTextInput2.text();
    t.equal(f2, 'Comment', 'Its text content is the placeholder (hence empty)');

    try {
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().textContains("I actually hate")',
        1000,
      );
      t.fail('Should not have seen the deleted draft reply');
    } catch (err) {
      t.pass('I dont see the deleted draft reply in the thread');
    }

    const backButton2 = await driver.elementByAndroidUIAutomator(
      'new UiSelector().descriptionContains("Back Button")',
      6000,
    );
    t.ok(backButton2, 'I see the back button');
    await backButton2.click();
    t.pass('I tap it');

    t.ok(
      await driver.waitForElementByAndroidUIAutomator(
        'new UiSelector().text("Public board")',
        6000,
      ),
      'I see the Central screen',
    );

    t.end();
  });
};
