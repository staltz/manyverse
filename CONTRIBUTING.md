# Contributor docs

## Installation and dev setup

This project uses React Native, Android SDK, Node.js and NPM.

### React Native specifics

Use node `^10.13.0` and npm `~6.4.1`, and follow the [official React Native docs](https://facebook.github.io/react-native/docs/getting-started.html).

Also install the CLI:

```
npm install --global react-native-cli
```

### macOS specifics

If you are developing on a macOS, then you might need `realpath`, install it through coreutils:

```
brew update
brew install coreutils
```

### Android specifics

You need Android Studio and a recent Android SDK (installable through Android Studio).

You may need to open your app's `/android` folder in Android Studio, so that it detects, downloads and cofigures requirements that might be missing, like the NDK and CMake to build the native code part of the project. **OR** download those via the sdkmanager `$ANDROID_HOME/tools/bin/sdkmanager 'ndk-bundle' 'cmake;3.6.4111459'`.

You can also set the environment variable `ANDROID_NDK_HOME`, as in this example:

```
export ANDROID_NDK_HOME=/Users/username/Library/Android/sdk/ndk-bundle
```

Also check out [nodejs-mobile](https://github.com/janeasystems/nodejs-mobile) repository for the necessary prerequisites for your system.

This app only supports Android 5.0 and above.

### Manyverse specifics

```
npm i
```

## Build and run in development

You can run `npm run build-android-debug` which will run all the necessary scripts in order. Or run each step manually:

`1`: Compile TypeScript files

```
npm run lib
```

`2`: Propagate replacement modules throughout all dependencies using [propagate-replacement-fields](https://github.com/staltz/propagate-replacement-fields):

```
npm run propagate-replacements
```

`3`: Build the "backend" Node.js project (which runs ssb-server):

```
npm run build-backend-android
```

`4`: Build the Android apk:

```
react-native run-android --variant=indieDebug
```

During step 4, another terminal may spawn with the React Native Metro bundler. The app should be installed automatically, if you have a device connected by USB. You can see the logs with `react-native log-android` or `adb logcat`.

In step 3, if you want to see more logs, then run `npm run build-backend-android -- --verbose`.

### Continuous compilation

To watch source code files and continuously compile them, use three terminals:

- One terminal continuously running `$(npm bin)/tsc --watch` to compile the TypeScript code
- One terminal continuously running `npm run clean-bundler && npm start -- --reset-cache` for the Metro bundler
- One terminal where you run `npm run build-android-debug` once to build and install the APK

To "refresh" the app after editing frontend TypeScript code, run the following (it refreshes the JS and re-opens the app):

```
adb shell input text "RR" && sleep 5 && adb shell am force-stop se.manyver && adb shell monkey -p se.manyver 1
```

There is no support for continuously compiling the backend Node.js project.

### Troubleshooting

On Android applications, the `react-native` build process is sometimes unable to rebuild assets.
If you are getting errors while building the application using `react-native run-android --variant=indieDebug`, then the command `npm run full-clean` can help you do a clean rebuild of the project. Then, reinstall with `npm i` and rebuild.

#### app:installDebug FAILED - Could not find build of variant which supports .. an ABI in x86

ManyVerse only supports ARM architectures, but most virtual device emulators use an x86 architecture of the host computer, and are therefore not supported.

Debug your code using a 'real' mobile device connected over USB instead.

#### NullPointerException on `npm run build-backend-android`

If you see the error below while running the `build-backend-android` build script, you should try opening this project's `android` folder in android studio (using the `build.gradle` file to tell android studio it is a gradle project.) It should detect missing dependencies and give you the option to install them via the console window (and rebuild) at the bottom of the window.

```

Building native modules for armeabi-v7a...
Incremental java compilation is an incubating feature.

FAILURE: Build failed with an exception.

* What went wrong:
A problem occurred configuring project ':app'.
> Could not resolve all dependencies for configuration ':app:_debugApk'.
   > A problem occurred configuring project ':nodejs-mobile-react-native'.
      > java.lang.NullPointerException (no error message)

```

## Issue labels

For every issue, pick a **type**, a **scope**, and a **priority**:

- **Type** indicates what audience the issue is relevant to
  - `dx` means "developer experience" so these are issues that are related to refactoring, improving build system, tests, etc
  - `ux` means "user experience" and can be either `ux: feature` or `ux: bug fix` to indicate to the user what kind of improvement this was
  - Every git commit message starts with either `ux:` or `dx:`, and the changelog is generated from the commit history, where only `ux` commit messages are shown. This means the commit messages are literally the changelog that appears to users when they update the app
- **Scope** indicates what part of the codebase this issue is about. So far the codebase has only two relevant "places":
  - `scope: backend` refers to the background Node.js project running the SSB server
  - `scope: frontend` refers to the UI code in React Native and Cycle.js
  - In the future there should be `scope: android` and `scope: ios` and maybe `scope: desktop`
- **Priority** indicates how urgent/important the issue is, and I use 4 weights:
  - `priority 1 (maybe)` this is something we will maybe do
  - `priority 2 (could)` this is something we could do
  - `priority 3 (should)` this is something we should do
  - `priority 4 (must)` this is something we must do

There's also a rule for `priority` labeling: `must < should < could < maybe`. In other words, the number of `must` issues has to be less than the number of `should` issues, which has to be less than the number of `could` issues, etc. This gives a funnel shape to the kanban board, [see here](https://gitlab.com/staltz/manyverse/boards).

Ideally, in a team of N developers working on Manyverse, there are N issues marked **work in progress**. In the "must" column, there are usually 2~4 issues per developer, which means at any time I choose the next work to do, I only have to pick one issue out of three, approximately. I try to keep a somewhat golden ratio progression (i.e. more than 1x, less than 2x multiplication) to the shape of the funnel, but it doesn't need to be so strictly organized. The importance of organizing the issues is also proportional to the priority:

- It's _very_ important to keep the "must" column organized and well chosen
- It's _somewhat_ important to keep the "should" column organized and well chosen
- It's not that important to keep the "could" column organized
- It's not important to keep the "maybe" column organized

Once in a while, as issues get done, we go through the issues in lower priorities and begin promoting them to higher levels. You can think of this funnel as a job interview process with multiple stages of interviews. We try to imagine which of these issues "earns its spot" the best. And usually give priority to fixing bugs, because it's worth building new features after the current user experience is mostly bugless. But every month there should be at least one new feature, even a small feature suffices.

This funnel shape also works for the [Feature roadmap](https://gitlab.com/staltz/manyverse/wikis/roadmap), which is kind of like a backlog, but less actionable, it's basically a backlog of ideas, while the issues are a backlog of tasks to perform as a developer.

Then there are less important issues, that are used just for communication:

- `~ work in progress` used just to create a column in the kanban board
- `~ testing` also for having a column in the kanban board, indicates issues that were developed but need further testing before releasing
- `type: discussion` discussion issues are not issues (tasks) at all, but sometimes people open these, so I don't want to delete them
- `closed because: ...` which inform why a certain issue was closed, e.g.
  - `closed because: fixed` ("done")
  - `closed because: is discussion` this one is used for every `type: discussion` issue because I don't want discussions to seem like actionable tasks, but I don't want closing to feel like dismissal of the conversation, this turns out to be quite useful as people understand that all discussion issues are closed by default
  - etc
- `~ contribute` just an indicator that the maintainers would gladly welcome anyone to try out solving this issue

## Codebase overview

The app is built on these technologies:

- [React Native](https://facebook.github.io/react-native/) (frontend)
- [Node.js Mobile](https://code.janeasystems.com/nodejs-mobile/) (backend)
- [Scuttlebutt](https://www.scuttlebutt.nz/) (backend and frontend)
- [TypeScript](https://www.typescriptlang.org/) (backend and frontend)
- [Cycle.js / xstream](https://cycle.js.org/) (frontend)
- [Pull streams](https://github.com/pull-stream/pull-stream/) (backend and frontend)

There are three important parts to the app, executing in runtime as different threads: **frontend thread** handles UI logic for the features, **backend thread** handles local database and peer-to-peer networking capabilities, **app thread** lightly coordinates the lifecycle of the app and creation of the other two threads.

```
+---------------------------------+
|         FRONTEND THREAD         |
|                                 |         +----------------------------------+
|   TypeScript  (dev language)    |         |            APP THREAD            |
|   JavaScript  (target language) |         |----------------------------------|
|     Cycle.js  (framework)       |<------->|                                  |
| React Native  (JS runtime env)  |         |            Java  (language)      |
| src/frontend  (path to src)     |         |     Android SDK  (framework)     |
|        8000+  (lines of code)   |         |    React Native  (framework)     |
+---------------------------------+         | android/app/src  (path to src)   |
                                            |            150+  (lines of code) |
+---------------------------------+         |                                  |
|         BACKEND THREAD          |         |                                  |
|                                 |<------->|                                  |
|   TypeScript  (dev language)    |         |                                  |
|   JavaScript  (target language) |         |                                  |
|   ssb-server  (plugin system)   |         +----------------------------------+
|      Node.js  (JS runtime env)  |
|  src/backend  (path to src)     |
|         300+  (lines of code)   |
+---------------------------------+
```

Most app development happens in `src/frontend` and thus follows the [Cycle.js](https://cycle.js.org/) architecture, but utilizes React Native components for rendering. It's good to get familiar with the architecture, but here is an explanation of it in a nutshell:

- Each _screen_ in the app is a Cycle.js component
- A Cycle.js component is a function with `sources` as input and `sinks` as output
- `Sources` is an object with several "source" streams, one stream per "channel"
- `Sinks` is an object with several "sink" streams, one stream per channel
- A **channel** is a name designated to a certain type of effect, for instance, we have the channels:
  - `asyncstorage`: for communication with the local lightweight database
  - `ssb`: for communication with the SSB database
  - `clipboard`: for reading or writing to the clipboard
  - `screen`: for sending UI updates to render on the screen, or for listening to UI events
  - `dialog`: for creating and interacting with UI dialogs overlaying the app
  - etc
- **Drivers** handle interactions with channels, there is typically one **driver** per channel, for instance see `src/frontend/drivers/dialogs.ts`
- In a Cycle.js component, _data flows_ from the sources to the sinks, passing through _transformations and combination_ steps in between
- Transformation and combination of streams is done with **stream operators** from the library [xstream](https://github.com/staltz/xstream/)
- Typically, streams are created and transformed in these sections:
  - `intent`: handles raw streams of UI events and interprets what they mean, creating "action" streams
  - `model`: take action streams as input and return "reducer" streams as outputs, to change the UI state
  - `view`: takes a stream of UI state as input and returns a stream of React elements
  - `ssb`: takes a stream of actions as input and returns a stream of SSB requests to make
  - etc

## Integration tests

We use Appium and Tape, just plug in a device through USB and run `npm run test-e2e-android`. This will run tests on top of the _release_ variant of the app, so it that doesn't exist, you must run `npm run build-android-release` first. See the guide below on how to generate release builds.

## Releases

To build a release APK, follow these instructions:

### Generating an upload key

You can generate a private signing key using `keytool`. On Windows `keytool` must be run from `C:\Program Files\Java\jdkx.x.x_x\bin`.

    $ keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

This command prompts you for passwords for the keystore and key and for the Distinguished Name fields for your key. It then generates the keystore as a file called `my-release-key.keystore`.

The keystore contains a single key, valid for 10000 days. The alias is a name that you will use later when signing your app, so remember to take note of the alias.

On Mac, if you're not sure where your JDK bin folder is, then perform the following command to find it:

    $ /usr/libexec/java_home

It will output the directory of the JDK, which will look something like this:

    /Library/Java/JavaVirtualMachines/jdkX.X.X_XXX.jdk/Contents/Home

Navigate to that directory by using the command `$ cd /your/jdk/path` and use the keytool command with sudo permission as shown below.

    $ sudo keytool -genkey -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

_Note: Remember to keep the keystore file private. In case you've lost upload key or it's been compromised you should [follow these instructions](https://support.google.com/googleplay/android-developer/answer/7384423#reset)._

### Setting up Gradle variables

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

### Generating the release APK

Run `cd android && ./gradlew assembleRelease` (just builds the APK).

## Deploying new versions

Follow this guideline strictly.

### Android

First make an Android release, then an iOS release.

- Run `npm run release-android` on a computer that can build Android
- Deploy to Dat Installer
  - `cd ../dat-release-latest` and `dat sync`
- Install new version through Dat Installer and make sure it works
- `git push origin master`

### iOS

Then make an iOS release:

- `git pull origin master` on a computer that can build iOS
- Run `npm run release-ios`
- Once done, it should an _Organizer_ window where you should upload the new version to App Store

### Publish

- Publish Android on F-Droid: `git push origin --tags` (F-Droid server pulls our updates)
- Publish Android to Google Play
  - Take the APK file from `android/app/build/outputs/apk/googlePlay/release`, upload and publish it on Google Play developer website
- Publish iOS to the App Store
  - Open the website and the new version should have been uploaded by now
- Announce on Scuttlebutt
  - Run `npm run echo-ssb-post`, it shows in the terminal a ready markdown post, publish that into Scuttlebutt under the hashtag `#manyverse`
- Announce on Twitter
  - Copy-paste from CHANGELOG.md the list of updates for the latest version, write it in the Twitter `@manyver_se` account and publish
- Announce on Mastodon
  - Copy paste from Twitter
- Sync Archival Dat
  - `cd ../dat-release-all` and `dat sync` (uploads to the Dat swarm)
