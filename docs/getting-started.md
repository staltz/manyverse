<!--
SPDX-FileCopyrightText: 2021-2023 The Manyverse Authors

SPDX-License-Identifier: CC-BY-4.0
-->

# Getting started

Thank you for your interest in contributing code to Manyverse! Follow this guide **rigorously**, as it contains a lot of important details. The compilation of the app may not work with other settings.
In the explanations below, we will constantly refer to "development" and "target" operating systems.

💻 "Development OS" means the operating system of the computer you are using to develop and compile the app.

📱 "Target OS" means the operating system of the devices that you wish Manyverse to run on once you compile the app.

## 💻 Setting up your development computer

### Development OS

- If your target OS is **iOS**, only **macOS** computers are supported
- If your target OS is **Android**, only **Linux and macOS** computers are supported
  - _No Windows support_ so far, unfortunately; but you can always choose to install Linux for free if you have a Windows computer
- If your target is **desktop**, then **Linux**, **macOS** and **Windows** computers are supported

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

If you're on macOS 12.5+, then you'll need to setup python2 because it was removed from the OS level.

1. `brew install pyenv`
2. `brew install pyenv-virtualenv`
3. `pyenv install 2.7.18`
4. `pyenv global 2.7.18`

<!-- ⚠
The paragraph below is commented out because we use --no-rust for all iOS compilations, on any version of macOS. So technically macOS Big Sur should be supported now.

️ **macOS Big Sur is not supported!** Manyverse only builds on macOS Catalina or older versions. This is because Apple made significant changes to how linking dynamic libraries work, and most non-Apple tooling (which we depend on) hasn't updated yet. For more information, read [issue 1371](https://gitlab.com/staltz/manyverse/-/issues/1371). You may have luck if you compile the backend without Rust, using `npm run build-backend-ios -- --no-rust` (read more about that some sections below). -->

### Windows specifics

If you are developing Manyverse desktop on a Windows computer, then we recommend [choco](https://chocolatey.org/) to install the required tools.

Then make sure you run the following commands to install the required tools for building Node.js native addons:

- `choco install python3`
- `choco install visualstudio2017-workload-nodebuildtools`
- `npm i -g windows-build-tools`


### Node.js

Use node (preferably exactly) **`16.17.x`** and npm `8.x`. To manage node versions easily, we recommend [nvm](https://github.com/nvm-sh/nvm) and use its deep integration feature to install and load the required node version automatically.

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
set the environment variable NDK_PLATFORM to "android-21" in the shell rc file.

Add your debug keystore information to the `~/.gradle/gradle.properties` file.

Also check out [nodejs-mobile docs](https://code.janeasystems.com/nodejs-mobile/getting-started-android#android-sdk-requirements) for the additional Android SDK requirements on your computer.

This app only supports Android 5.0 and above.

### iOS SDK

If your target OS is iOS, you need to install Xcode (version 12.4 or higher). You can find Xcode from the macOS App Store. The iOS SDK must be version 11 or higher.

See also [nodejs-mobile docs](https://code.janeasystems.com/nodejs-mobile/getting-started-ios#development-prerequisites) for additional details.

We also recommend to enforce Node.js 16.17.x in Xcode's environment when build scripts are run. You do that by creating the file `ios/.xcode.env.local` with the contents:

```bash
#!/bin/bash

if [ -f ~/.nvm/nvm.sh ]; then
  source ~/.nvm/nvm.sh;
  nvm use 16; # This is not necessary if nvm has 16 as default
fi
```

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
npm install --legacy-peer-deps
```

Then, create the `translations` folder as a symlink:

```
ln -s android/app/src/main/assets/translations translations
```

### When targeting Android

There is nothing else you need to install at this point.

### When targeting iOS

If you need to install Cocoapods you can get it from your ruby's `gem` with either `gem install cocoapods` or `sudo gem install cocoapods` depending on if your ruby requires sudo to install gems globally.

Then you need to also install the Cocoapods themselves.

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

In step 3, if you want to see more logs, then run `npm run build-backend-ios -- --verbose`.

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

If everything went well you can try `npm run desktop`. It will use [prebuilt Electron binary][npm-electron]. It's worth noting this will share a database with any official builds of ManyVerse you may have on your system.

If your system is not [officially supported][electron-supported-platforms] you can install Electron using your distribution's preferred method (make sure to get a version that is compatible with app's dependency) and launch it yourself:

```
$ cd desktop
$ npm ls electron
backend@0.0.0 ~/manyverse/desktop
└── electron@15.2.0
$ npx electron --version
v15.2.0
$ npx electron .
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
