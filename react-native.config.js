// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: Unlicense

module.exports = {
  dependencies: {
    'nodejs-mobile-react-native': {
      platforms: {
        // Ignored because we need to set this up manually in order to
        // call some APIs of this library directly in our MainActivity.java
        android: null,
      },
    },
    'react-native-bluetooth-socket-bridge': {
      platforms: {
        // This package needs some config passed as arguments to the constructor
        // so we need to "link" it manually in MainApplication.java
        android: null,

        // On iOS, we are postponing the support for Bluetooth as a transport
        ios: null,
      },
    },
  },
};
