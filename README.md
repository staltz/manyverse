# MMMMM client for Secure Scuttlebutt

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