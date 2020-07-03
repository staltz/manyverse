This folder contains data for an SSB demo that should be loaded somewhere on the internet so that Apple reviewers can test the app and its new versions.

In the demo scuttleverse, there are accounts that follow each other, Jane and Sarah. Jane's recovery words are available in the file `jane-recovery-words.txt`.

This folder corresponds to the `~/.ssb` folder for Sarah. Sarah has replicated Jane's data.

For Apple reviewers to recover Jane's account, they need: (1) Jane's recovery words, (2) Room invite code where Sarah will be online while they review the app.

The following text should be given to Apple reviewers, note the necessary `% SUBSTITUTIONS %`:

---

The user accounts in this app are local to each device, so there is no username & password to use because there is no sign in. But the app allows backing up the account, so I have used that feature to allow you to test a demo account. I'll explain how to restore the backed up demo account.

You can think of this app as a diary app, you can write posts but when published these will only be local to the device. You can share your diary to friends on the same Wi-Fi network as you, or friends that are connected to the same community server as you are. Steps to restore the backed up account:

1. Go through the welcome screen until the end
2. Choose "Restore account"
3. Type in the following 24 words

`% JANE's RECOVERY WORDS %`

4. Press Confirm
5. On the main screen, go to the "Connections" tab on the right side
6. Press the green button to add a server connection
7. Choose "Paste invite"
8. Type in the following invite code

`% SSB ROOM INVITE CODE %`

9. Wait a few seconds for the account data to be recovered from the server
10. Go back to the feed tab on the left side
11. Pull to refresh
12. See messages from "Jane", the recovered account
