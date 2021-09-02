# Contributor docs

Thank you for your interest in contributing code to Manyverse! Follow this guide **rigorously**, as it contains a lot of important details. The compilation of the app may not work with other settings.

In the explanations below, we will constantly refer to "development" and "target" operating systems.

💻 "Development OS" means the operating system of the computer you are using to develop and compile the app.

📱 "Target OS" means the operating system of the devices that you wish Manyverse to run on once you compile the app.

## 💻 Setting up your development computer

### Development OS

- If your target OS is **iOS**, only **macOS** computers are supported
- If your target OS is **Android**, only **Linux and macOS** computers are supported
  - _No Windows support_ so far, unfortunately; but you can always choose to install Linux for free if you have a Windows computer
- If your target is **desktop**, **Linux and macOS** computers are supported

### Development Container

This project comes with a devcontiner configuration for Visual Studio Code / Code OSS. When opening the project as a *Dev Container* in Visual Studio Code / Code OSS you will
be able to use all the required tools for the **Android** target environment without installing them on the host system. However, on some systems it is not possible to access USB devices from
the container, in this case you have to access the device for access over the net.

From a device from which you can connect your device, run: `adb tcpip 5555`
From the docker container run: `adb connect <your-phone's-ip>:5555`

### Linux specifics

If you are developing on a Linux computer, then you might need to have GCC and `g++` installed on your operating system. On Ubuntu, you can install it with

```
sudo apt install build-essential libtool
```

### macOS specifics

If you are developing on a macOS computer, then you might need `realpath`, install it through coreutils and some additional `node-sodium` compilation dependencies:

```
brew update
brew install coreutils libtool autoconf automake
```

⚠️ **macOS Big Sur is not supported!** Manyverse only builds on macOS Catalina or older versions. This is because Apple made significant changes to how linking dynamic libraries work, and most non-Apple tooling (which we depend on) hasn't updated yet. For more information, read [issue 1371](https://gitlab.com/staltz/manyverse/-/issues/1371). You may have luck if you compile the backend without Rust, using `npm run build-backend-ios -- --no-rust` (read more about that some sections below).

### Node.js

Use node (preferably exactly) **`12.19.0`** and npm `6.x`. To manage node versions easily, we recommend [nvm](https://github.com/nvm-sh/nvm) and use its deep integration feature to install and load the required node version automatically.

### Rust

Install Rust (preferably exactly) **`1.54.0`** and Cargo through [Rustup](https://rustup.rs/). Then, use Rustup to install cross-compilation support for various ARM architectures, like this:

#### Android

If your target OS is Android, then run:

```
rustup target add aarch64-linux-android
```

```
rustup target add arm-linux-androideabi
```

```
rustup target add armv7-linux-androideabi
```

#### iOS

If your target OS is iOS, then run:

```
rustup target add aarch64-apple-ios
```

```
rustup target add x86_64-apple-ios
```

### React Native

Install the React Native CLI:

```
npm install --global react-native-cli
```

and follow the [official React Native docs](https://reactnative.dev/docs/environment-setup), choose "React Native CLI Quickstart", and then choose the **Development OS** and **Target OS** to match your use case.

### Android SDK

If your target OS is Android, make sure you have the Android SDK CLI installed locally so you can run [`sdkmanager`](https://developer.android.com/studio/command-line/sdkmanager). To install the Android SDK CLI, [follow these instructions](https://developer.android.com/studio/#command-tools) ("Command line tools only").

Then use `sdkmanager` to install these components:

```
sdkmanager 'build-tools;28.0.3' 'cmake;3.6.4111459' 'ndk;21.4.7075529' 'platforms;android-29' 'tools'
```

You should also create the file `local.properties` in the `android` folder of this project, and set the contents of the file to this (note that you copy-pasting is not going to work!):

```
ndk.dir=/path/to/your/android/sdk/ndk/21.4.7075529
```

Add your debug keystore information to the `~/.gradle/gradle.properties` file.

Also check out [nodejs-mobile docs](https://code.janeasystems.com/nodejs-mobile/getting-started-android#android-sdk-requirements) for the additional Android SDK requirements on your computer.

This app only supports Android 5.0 and above.

### iOS SDK

If your target OS is iOS, you need to install Xcode (version 12.4 or higher). You can find Xcode from the macOS App Store. The iOS SDK must be version 11 or higher.

See also [nodejs-mobile docs](https://code.janeasystems.com/nodejs-mobile/getting-started-ios#development-prerequisites) for additional details.

## 📱 Setting up you target device

### Android

⚠️ **Emulators are not supported!** You must have a real device (smartphone or tablet) available, and a USB cable to connect it with your development computer.

The reason why emulators are not supported is because we use nodejs-mobile for the backend thread in the app, and this only supports ARM architectures. Most emulators are x86 architectures. There may be ARM-supporting emulators that are compatible with Manyverse, but we don't promise that it will work correctly there.

**Enable developer mode.** Before developing, you need to set up the Android device, following these steps:

- Open the Android settings, scroll down to "About phone"
- Scroll down to "Build number", and tap it 7 times
- It should inform "you are now a developer!" as a toast
- Plug your Android device to your computer via USB
- On the Android device, a popup appears, allow your computer access to the device

### iOS

⚠️ **Simulators are not supported!** You must have a real device (iPhone or iPad) available, and a USB cable to connect it with your development computer.

The reason why simulators are not supported is because we use nodejs-mobile for the backend thread in the app, and this only supports ARM architectures. iOS simulators run on your development computer, and use the x86 architecture.

It might be necessary to have an Apple's developer account, and your devices must be registered for development under that account. Take a look at React Native's [Running on device](https://reactnative.dev/docs/running-on-device) page, select target "iOS" and "Development OS: macOS".

## Setting up the Manyverse project

Git clone this repository to your computer, and then `cd` into the folder and run:

```
npm install
```

### When targeting Android

There is nothing else you need to install at this point.

### When targeting iOS

You need to also install the Cocoapods:

```
cd ios && pod install
```

### When targeting desktop

There is nothing else you need to install at this point.

## Build and run in development

### When targeting Android

You can run `npm run android-dev` which will run all the necessary scripts in order. Or you can run each step manually:

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

`4`: Build and run the Android app:

```
react-native run-android --variant=indieDebug
```

During step 4, another terminal may spawn with the React Native Metro bundler. The app should be installed automatically, if you have a device connected by USB. You can see the logs with `react-native log-android` or `adb logcat`.

In step 3, if you want to see more logs, then run `npm run build-backend-android -- --verbose`.

### When targeting iOS

You can do it in Xcode or in the terminal. In Xcode, open the Manyverse project located in `./ios/Manyverse.xcworkspace`, and then press the "play" button.

In the terminal, you can run `npm run ios-dev` which will run all the necessary scripts in order. Or you can run each step manually:

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
npm run build-backend-ios
```

`4`: Build and run the iOS app:

```
react-native run-ios --device
```

During step 4, another terminal may spawn with the React Native Metro bundler. The app should be installed automatically, if you have a device connected by USB.

In step 3, if you want to see more logs, then run `npm run build-backend-ios -- --verbose`. If you want to disable Rust libraries, run `npm run build-backend-ios -- --no-rust`.

### When targeting desktop

You can run `npm run build-desktop` which will run all the necessary scripts in order. Or you can run each step manually:

`1`: Compile TypeScript files

```
npm run lib
```
`2`: Build the "backend" Node.js project (which runs ssb-server):

```
npm run build-backend-desktop
```

`3`: Build the Electron frontend:

```
npm run build-frontend-desktop
```

##### Starting the app

If everything went well you can try `npm run desktop`. It will use [prebuilt Electron binary][npm-electron].

If your system is not [officially supported][electron-supported-platforms] you can install Electron using your distribution's preferred method (make sure to get a version that is compatible with app's dependency) and launch it yourself:

```
$ cd desktop/nodejs-project/
$ npm ls electron
backend@0.0.0 ~/manyverse/desktop/nodejs-project
└── electron@10.3.1
$ electron --version
v10.4.7
$ electron .
```

[electron-supported-platforms]: https://www.electronjs.org/docs/tutorial/support#supported-platforms
[npm-electron]: https://www.npmjs.com/package/electron

### Continuous compilation

To watch source code files and continuously compile them for mobile, use three terminals:

- One terminal continuously running `$(npm bin)/tsc --watch` to compile the TypeScript code
- One terminal continuously running `npm run clean-bundler && npm start -- --reset-cache` for the Metro bundler
- One terminal where you run `npm run android-dev` or `npm run ios-dev` once to build and install the app

For Android, to "refresh" the app after editing frontend TypeScript code, run the following (it refreshes the JS and re-opens the app):

```
adb shell input text "RR" && sleep 5 && adb shell am force-stop se.manyver && adb shell monkey -p se.manyver 1
```

To continuously build the frontend for desktop, run `npm run desktop-dev`. To load the new build you need to close electron and launch it again with `npm run desktop`.

There is no support for continuously compiling the backend Node.js project.

Pro tip: instead of `npm run clean-bundler && npm start -- --reset-cache`, you can also call make your own bash script called `rn-clean` which does a full clean and rebuild of the Metro bundling. This is useful also for other React Native projects you may have. Add the following to your `~/.bashrc` or `~/.zshrc`:

```bash
function rn-clean() {
  watchman watch-del-all
  rm -rf $TMPDIR/react-*
  rm -rf $TMPDIR/haste-*
  rm -rf $TMPDIR/metro-*
  npm start -- --reset-cache
}
```

Then just call `rn-clean` in the terminal.

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

#### Error: Command failed: npm install --no-optional on `npm run build-backend-android`

Newly installed systems might lack some essential development tools, but this error, in particular, is not very clear on what is happening. To further debug this error go to the `nodejs-assets/nodejs-mobile` directory and run `npm install` inside that directory.

If you get the following output, you need to [install additional development tools](https://github.com/paixaop/node-sodium/issues/136#issuecomment-442906136) on your system:

```bash
> node-gyp-build "node preinstall.js" "node postinstall.js"

libtool is required, but wasn't found on this system
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
| React Native  (JS runtime env)  |         | Java/ObjectiveC  (language)      |
| src/frontend  (path to src)     |         | Android/iOS SDK  (framework)     |
|        8000+  (lines of code)   |         |    React Native  (framework)     |
+---------------------------------+         | android/app/src  (path to src)   |
                                            |   ios/Manyverse  (path to src)   |
                                            |            250+  (lines of code) |
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

📽️ **Watch this [screencast on YouTube](https://www.youtube.com/watch?v=iv7FEbLKNUI) where Andre Staltz and David Gómez have a walkthrough the basics of thee app architecture**

## Backend in Node.js Mobile

There is lots to be explained about the backend part of this project, so consider this subsection docs a work in progress.

### How to add a new ssb-neon package

- Add it in `src/backend/package.json`
- Create a patch for this package using `patch-package`
  - Run `rm -rf nodejs-assets`
  - Run `tools/backend/move-to-nodejs-assets.sh`
  - Run `cd nodejs-assets/nodejs-project`
  - Run `rm -rf patches`
  - Run `npm install --no-optional`
  - Run `$(npm bin)/patch-package NAME_OF_THE_PACKAGE`
  - Copy the file `./patches/NAME_OF_THE_PACKAGE` to `src/backend/patches`
- Update `tools/backend/noderify-mobile.sh` to add a `replace` option
- Update `tools/backend/noderify-desktop.sh` to add a `replace` option
- Update `tools/backend/patch-android-ssb-neon-modules.sh` to add the package in the `modules` array
- Update `tools/backend/patch-ios-ssb-neon-modules.sh` to add the package in the `modules` array
- (Optional) Update `tools/backend/remove-unused-files.sh` to remove the package's `prebuilds` folder and others

## Integration tests

**Only Android is supported for end-to-end tests at the moment.**

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

- Use a computer that can build Android apps
- `npm run release-android` to compile the Android APK
- `npm run install-android-indie` to install the new APK on a device and make sure it works
- `git push origin master` to update the repository

### iOS

Then make an iOS release:

- Use a computer that can build iOS apps
- `git pull origin master` to update the repository
- `npm run release-ios` to compile the iOS IPA
- `git push origin master` to update the repository
- Once done, it should open an _Organizer_ window where you must upload the new version to App Store

### Publish

- Deploy as an APK on the website
  - Go to `android/app/build/outputs/apk/indie/release` and copy the `app-indie-release.apk` file
  - Put the file in the manyverse-website repo and deploy the website
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
