<!--
SPDX-FileCopyrightText: 2021 The Manyverse Authors

SPDX-License-Identifier: CC-BY-4.0
-->

# Releases

To build a release APK for Android, follow these instructions:

## Generating an upload key

You can generate a private signing key using `keytool`. On Windows `keytool` must be run from `C:\Program Files\Java\jdkx.x.x_x\bin`.

    $ keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

This command prompts you for passwords for the keystore and key and for the Distinguished Name fields for your key. It then generates the keystore as a file called `my-release-key.keystore`.

The keystore contains a single key, valid for 10000 days. The alias is a name that you will use later when signing your app, so remember to take note of the alias.

On Mac, if you're not sure where your JDK bin folder is, then perform the following command to find it:

    $ /usr/libexec/java_home

It will output the directory of the JDK, which will look something like this:

    /Library/Java/JavaVirtualMachines/jdkX.X.X_XXX.jdk/Contents/Home

_Note: Remember to keep the keystore file private. In case you've lost upload key or it's been compromised you should [follow these instructions](https://support.google.com/googleplay/android-developer/answer/7384423#reset)._

## Setting up Gradle variables

1. Place the `my-release-key.keystore` file under the `android/app/` directory in your Manyverse project folder.
2. Edit the file `~/.gradle/gradle.properties` or `android/gradle.properties`, and add the following (replace `*****` with the correct keystore password, alias and key password),

```
MYAPP_RELEASE_STORE_FILE=my-upload-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

These are going to be global Gradle variables, which we can later use in our Gradle config to sign our app.

_Note about security: If you are not keen on storing your passwords in plaintext, and you are running OSX, you can also [store your credentials in the Keychain Access app](https://pilloxa.gitlab.io/posts/safer-passwords-in-gradle/). Then you can skip the two last rows in `~/.gradle/gradle.properties`._

## Generating the release APK

Run `cd android && ./gradlew assembleRelease` (just builds the APK).

# Deploying new versions

Follow this guideline strictly.

## Android

First make an Android release, then an iOS release.

- Use a computer that can build Android apps
- `npm run release-android` to compile the Android APK
- `npm run install-android-indie` to install the new APK on a device and make sure it works
- `git push origin master` to update the repository

## iOS

Then make an iOS release:

- Use a computer that can build iOS apps
- `git pull origin master` to update the repository
- `npm run release-ios` to compile the iOS IPA
- `git push origin master` to update the repository
- Once done, it should open an _Organizer_ window where you must upload the new version to App Store
- If you want to upload to Apple, do this:
  - In the _Organizer_, press "Distribute App"
  - "App Store Connect"
  - "**Upload**"
  - Proceed as usual
- If you want to test it on BrowserStack Live, do this:
  - In the _Organizer_, press "Distribute App"
  - "App Store Connect"
  - "**Export**"
  - Proceed as usual, and at the very end, press "Export" and choose a folder

## Desktop

These will be built automatically by GitHub Actions and published to [GitHub releases](https://github.com/staltz/manyverse/releases).

## Publish

- Deploy as an APK on the website
  - Go to `android/app/build/outputs/apk/indie/release` and copy the `app-indie-release.apk` file
  - Put the file in the manyverse-website repo at `./static/app-indie-release.apk`
  - Update the versionName at `./static/latestversion.json`
  - Deploy the website
- Publish Android to Google Play
  - Take the APK file from `android/app/build/outputs/apk/googlePlay/release`, upload and publish it on Google Play developer website
- Publish iOS to the App Store
  - Open the website and the new version should have been uploaded by now
  - Don't submit the new version yet, instead, do the below
  - Get the folder `e2e/apple-app-store-demo` and make it your `~/.ssb` (beware to backup any existing `~/.ssb` before)
  - Open a desktop SSB client such as Patchwork to use that `~/.ssb`
  - Create a new [ssb-room](https://github.com/staltz/ssb-room) server
  - Put the ssb-room invite code in Patchwork
  - Keep this Patchwork open (and the computer in non-sleep mode) for ~24 hours
  - Apple's reviewers should use the ssb-room invite and will connect to your Patchwork
  - Now should be safe to press submit on the App Store dashboard
- Publish Android on F-Droid: `git push origin --tags` (F-Droid server pulls our updates)
- Announce on Scuttlebutt
  - Run `npm run echo-ssb-post`, it shows in the terminal a ready markdown post, publish that into Scuttlebutt under the hashtag `#manyverse`
- Announce on Twitter
  - Copy-paste from CHANGELOG.md the list of updates for the latest version, write it in the Twitter `@manyver_se` account and publish
- Announce on Mastodon
  - Copy paste from Twitter
