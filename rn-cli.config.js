const blacklist = require('metro/src/blacklist');

module.exports = {
  getBlacklistRE: function() {
    return blacklist([
        /nodejs-assets\/.*/,
        /android\/.*/,
        /ios\/.*/
    ]);
  },
};
