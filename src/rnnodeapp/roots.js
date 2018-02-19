var pull = require('pull-stream');

var getRoot = require('patchcore/message/sync/root').create().message.sync.root;

function isRoot(msg) {
  const msgHasRoot = typeof getRoot(msg) === 'string';
  return !msgHasRoot;
}

function init(ssb, config) {
  return {
    read: function read(opts) {
      return pull(
        ssb.createFeedStream(opts),
        pull.filter(isRoot)
      );
    },
  };
}

exports.name = 'roots';
exports.version = '1.0.0';
exports.manifest = {
  read: 'source',
};
exports.permissions = {
  master: {allow: ['read']}
};
exports.init = init;
