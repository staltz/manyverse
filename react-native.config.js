module.exports = {
  dependencies: {
    'nodejs-mobile-react-native': {
      // Ignored because we need to set this up manually in order to
      // call some APIs of this library directly in our MainActivity.java
      platforms: {
        android: null,
      },
    },
    'react-native-bluetooth-socket-bridge': {
      // This package needs some config passed as arguments to the constructor
      // so we need to "link" it manually in MainApplication.java
      platforms: {
        android: null,
      },
    },
  },
};
