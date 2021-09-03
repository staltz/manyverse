/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const path = require('path');
const OriginalResolver = require('metro-resolver');
const blocklist = require('metro-config/src/defaults/exclusionList');

const IGNORE_ON_MOBILE = ['fs', 'nuka-carousel'];

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
    blacklistRE: blocklist([
      /\/android\/.*/,
      /\/desktop\/.*/,
      /\/benchmark\/.*/,
      /\/e2e\/.*/,
      /\/ios\/.*/,
      /\/lib\/backend\/.*/,
      /\/nodejs-assets\/.*/,
      /\/patches\/.*/,
      /\/src\/backend\/.*/,
      /\/tools\/.*/,
      // Not used in runtime (is either dev dependency or surely not used)
      /\/node_modules\/appium\/.*/,
      // Handled by Webpack (for Desktop), so Metro (for Mobile) can ignore:
      /\/node_modules\/@cycle\/react-dom\/.*/,
      /\/node_modules\/electron\/.*/,
      /\/node_modules\/electron\.*\/.*/,
      /\/node_modules\/react-dom\/.*/,
      /\/node_modules\/webpack\/.*/,
      /\/node_modules\/webpack-cli\/.*/,
    ]),
    resolveRequest: (context, realModuleName, platform, moduleName) => {
      const platformIsMobile = platform !== 'web';
      if (platformIsMobile && IGNORE_ON_MOBILE.includes(moduleName)) {
        return {
          filePath: path.resolve(__dirname + '/noop.js'),
          type: 'sourceFile',
        };
      } else {
        return OriginalResolver.resolve(
          {...context, resolveRequest: undefined},
          moduleName,
          platform,
        );
      }
    },
  },
};
