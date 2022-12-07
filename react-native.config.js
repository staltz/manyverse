// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
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
  },
};
