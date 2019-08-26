/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },

  resolver: {
    platforms: ['android', 'ios', 'web'],
    blacklistRE: blacklist([
      /\/android\/.*/,
      /\/desktop\/.*/,
      /\/e2e\/.*/,
      /\/ios\/.*/,
      /\/nodejs-assets\/.*/,
      /\/patches\/.*/,
      /\/tools\/.*/,
      // Not used in runtime (is either dev dependency or surely not used)
      /\/node_modules\/appium\/.*/,
    ]),
  },
};
