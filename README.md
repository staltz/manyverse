# MMMMM client for Secure Scuttlebutt

***ALPHA version! This is heavily under construction, not ready for real usage.***

## Install dependencies

Use node `v8.9.x` and npm `v5.6.x`.

**Mac OS note**: You might need `realpath`, install it through coreutils:

```
brew update
brew install coreutils
```

```
npm install --global react-native-cli
```

```
npm install
```

## Build/run in development

You can run `npm run first-build` which will run all the necessary scripts in order. Or run each step manually.

Build the "backend" Node.js project:

```
npm run build-nodejs-app
```

Build the worker thread subproject:

```
npm run build-worker-android
```

Then build the entire app:

```
react-native run-android
```

You can log the Node.js app:

```
npm run log
```


## Important Dependencies

- React Native
- TypeScript
- Cycle.js with xstream
- Pull streams
- react-native-workers (fork by staltz)
- Patchcore (with depject)

## Integration tests

We use Appium and Tape, just plug in a device through USB and run `npm run test-e2e-android`. This will run tests on top of the *release* variant of the app, so it that doesn't exist, you must run `npm run android-release` first.

## Releases

To build a release APK, follow [these instructions](https://facebook.github.io/react-native/docs/signed-apk-android.html), in short:

1. Put the correct file `my-release-key.keystore` in the folder `android/app/`
2. Configure the file `~/.gradle/gradle.properties` with the correct values
