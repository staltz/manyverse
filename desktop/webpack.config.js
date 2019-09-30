const path = require('path');

module.exports = {
  entry: './lib/desktop/index.js',
  target: 'electron-renderer',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
