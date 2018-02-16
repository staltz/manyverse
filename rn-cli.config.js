const path = require('path');

const sharedBlacklist = [
  /node_modules[/\\]react[/\\]dist[/\\].*/,
  /src\/rnnodeapp\/.*/,
];

const platformBlacklists = {
  web: ['.ios.js', '.android.js'],
  ios: ['.web.js', '.android.js'],
  android: ['.web.js', '.ios.js'],
};

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

function blacklist(platform, additionalBlacklist) {
  return new RegExp(
    '(' +
      (additionalBlacklist || [])
        .concat(sharedBlacklist)
        .concat(platformBlacklists[platform] || [])
        .map(escapeRegExp)
        .join('|') +
      ')$',
  );
}

module.exports = {
  getBlacklistRE(platform) {
    return blacklist(platform);
  },
};
