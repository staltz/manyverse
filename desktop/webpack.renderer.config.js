// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: Unlicense

const path = require('path');
const webpack = require('webpack');
const {presets} = require(`../babel.config.js`);

// https://arry.medium.com/how-to-add-react-native-web-to-an-existing-react-native-project-eb98c952c12f
const compileNodeModules = [
  '@react-native-community/slider',
  '@staltz/react-native-audio-toolkit',
  '@staltz/react-native-image-viewing',
  'react-native-localize',
  'react-native-root-siblings',
  'react-native-tiny-toast',
  'react-native-vector-icons',
  'react-native-floating-action',
  'react-native-gifted-chat',
  'react-native-typing-animation',
  'react-native-progress',
  'react-native-parsed-text',
  'react-native-system-setting',
  'react-native-lightbox',
  'static-container',
].map((moduleName) => path.resolve(__dirname, `../node_modules/${moduleName}`));

const ignoreNodeModules = [
  'react-native-dialogs',
  'react-native-fs',
  'react-native-navigation',
  'react-native-image-crop-picker',
  'react-native-orientation-locker',
  'react-native-swiper',
  'react-native-url-polyfill',
];

const ignoreRegex = new RegExp(`^(${ignoreNodeModules.join('|')})$`);

const babelLoaderConfiguration = {
  test: /\.js$|tsx?$/,
  // Add every directory that needs to be compiled by Babel during the build.
  include: [
    // path.resolve(__dirname, '../lib/desktop/'),
    ...compileNodeModules, // <-- Modules we compile above
  ],
  exclude: [
    // path.resolve(__dirname, '../node_modules/react-native-image-viewing')
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets,
      plugins: ['react-native-web'],
    },
  },
};

module.exports = {
  entry: './index.web.js',
  target: 'electron-renderer',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'renderer-dist'),
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      '~frontend': path.resolve(__dirname, '..', 'lib', 'frontend'),
      '~images': path.resolve(__dirname, '..', 'images'),
    },
    extensions: ['.web.js', '.js'],
  },
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name(resourcePath, resourceQuery) {
                // Keep logo_outline.png so we can use it in the splashscreen
                // on the HTML before any JS is running
                if (resourcePath.endsWith('logo_outline.png')) {
                  return 'logo_outline.png';
                } else {
                  return '[contenthash].[ext]';
                }
              },
            },
          },
        ],
      },
      {
        test: /\.ttf$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],
        include: [
          path.resolve(__dirname, '../node_modules/react-native-vector-icons'),
          path.resolve(__dirname, '../images/'),
        ],
      },
      {
        test: /\.woff(2)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: 'renderer-dist/',
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      // See: https://github.com/necolas/react-native-web/issues/349
      __DEV__: JSON.stringify(true),
    }),
    // for packages that break stuff even when you import them behind
    // a platform check
    new webpack.IgnorePlugin(ignoreRegex),
  ],
};
