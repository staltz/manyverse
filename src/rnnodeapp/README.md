This is the react-native-node background process. It has access to Node.js APIs, and executes `scuttlebot` with a few modifications to work correctly on mobile, such as using `leveldown-android-prebuilt` instead of `leveldown`, and patching some dependencies.

See `/tools/build-rnnodeapp` to understand how this gets integrated with the app.