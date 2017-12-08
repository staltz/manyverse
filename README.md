# MMMMM client for Secure Scuttlebutt

***ALPHA version! This is heavily under construction, not ready for real usage.***

## Install dependencies

Use node `v6.9.1` and yarn `v0.27.5`.

```
yarn
```

**Mac OS note**: You might need `realpath`, install it through coreutils:

```
brew update
brew install coreutils
```

## Build/run in development

```
react-native run-android
```

## Important Dependencies

- React Native
- TypeScript
- Cycle.js with xstream
- Pull streams
- react-native-scuttlebot
  - Uses react-native-node under the hood
    - Which in turn uses NodeBase (node.js v7 compiled for android arm devices)
- react-native-ssb-client
- Patchcore (with depject)

## Integration tests

We use Calabash, which is Ruby-based. Check [Calabash Android installation docs](https://github.com/calabash/calabash-android/blob/master/documentation/installation.md).

```
gem install bundler
```

```
cd e2e
```

```
bundle install
```

```
./test-features.sh
```

or `npm run test-e2e-android` from the root directory.
