# Contributor docs

## App uses these technologies:

- React Native
- Node.js Mobile
- Scuttlebot
- TypeScript
- Cycle.js with xstream
- Pull streams
- Patchcore (with depject)

## Install dependencies

### React Native specifics

Use node `v8.9.x` and npm `v5.6.x`, and follow the [official React Native docs](https://facebook.github.io/react-native/docs/getting-started.html).

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
npm install
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

`3`: Build the "backend" Node.js project (which runs Scuttlebot):

```
npm run build-nodejs-app
```

`4`: Build the Android apk:

```
react-native run-android
```

During step 5, another terminal may spawn with the React Native Metro bundler. The app should be installed automatically, if you have a device connected by USB. You can see the logs with `react-native log-android` or `adb logcat`.

### Continuous compilation

To watch source code files and continuously compile them, use three terminals:

- One terminal running `$(npm bin)/tsc --watch` to compile the TypeScript code
- One terminal running `npm run clean-bundler && npm start -- --reset-cache` for the Metro bundler
- One terminal where you can run `npm run build-android-debug` to build the APK

There is no support for continuously compiling the backend Node.js project.

### Troubleshooting

On Android applications, the `react-native` build process is sometimes unable to rebuild assets.
If you are getting errors while building the application using `react-native run-android`, then the command `npm run full-clean` can help you do a clean rebuild of the project. Then, reinstall with `npm install` and rebuild.

#### NullPointerException on `npm run build-nodejs-app`

If you see the error below while running the `build-nodejs-app` build script, you should try opening this project's `android` folder in android studio (using the `build.gradle` file to tell android studio it is a gradle project.) It should detect missing dependencies and give you the option to install them via the console window (and rebuild) at the bottom of the window.

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

## Integration tests

We use Appium and Tape, just plug in a device through USB and run `npm run test-e2e-android`. This will run tests on top of the *release* variant of the app, so it that doesn't exist, you must run `npm run build-android-release` first.

## Releases

To build a release APK, follow [these instructions](https://facebook.github.io/react-native/docs/signed-apk-android.html), in short:

1. Put the correct file `my-release-key.keystore` in the folder `android/app/`
2. Configure the file `~/.gradle/gradle.properties` with the correct values
3. Run `cd android && ./gradlew assembleRelease` (just builds the APK) or `npm run release` (for official releases)