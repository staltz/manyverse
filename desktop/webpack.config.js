const path = require('path');
const webpack = require('webpack');
const {presets} = require(`../babel.config.js`);

// https://arry.medium.com/how-to-add-react-native-web-to-an-existing-react-native-project-eb98c952c12f
const compileNodeModules = [
  '@react-native-community/slider',
  '@react-native-community/audio-toolkit',
  // 'react-native-image-viewing',
  'react-native-localize',
  'react-native-root-siblings',
  'react-native-tiny-toast',
  'react-native-vector-icons',
  'static-container',
].map((moduleName) => path.resolve(__dirname, `../node_modules/${moduleName}`));

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
  entry: './lib/desktop/index.js',
  target: 'electron-renderer',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
    extensions: ['.web.js', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      babelLoaderConfiguration,
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      // See: https://github.com/necolas/react-native-web/issues/349
      __DEV__: JSON.stringify(true),
    }),
  ],
};
