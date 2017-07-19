# MMMMM client for Secure Scuttlebutt

## Important Dependencies

- React Native
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
cd android/app
```

```
bundle install
```

```
./test-features.sh
```

or `npm run test-e2e-android` from the root directory.