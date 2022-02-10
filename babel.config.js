// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: Unlicense

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        cwd: 'babelrc',
        extensions: ['.js', '.ios.js', '.android.js', '.web.js'],
        alias: {
          '~frontend': './lib/frontend',
          '~images': './images',
        },
      },
    ],
  ],
};
