/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

const path = require('path');

const blacklistRE = new RegExp(
  '(' +
    [/nodejs-assets\/.*/, /android\/.*/, /ios\/.*/]
      .map(escapeRegExp)
      .join('|') +
    ')$',
);

function escapeRegExp(pattern) {
  if (Object.prototype.toString.call(pattern) === '[object RegExp]') {
    return pattern.source.replace(/\//g, path.sep);
  } else if (typeof pattern === 'string') {
    const escaped = pattern.replace(
      /[\-\[\]\{\}\(\)\*\+\?\.\\\^\$\|]/g,
      '\\$&',
    );
    // convert the '/' into an escaped local file separator
    return escaped.replace(/\//g, `\\${path.sep}`);
  }
  throw new Error(`Unexpected packager blacklist pattern: ${pattern}`);
}

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
    blacklistRE,
  },
};
