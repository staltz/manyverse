const path = require('path');

module.exports = {
  entry: './index.desktop.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
