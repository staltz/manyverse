const fs = require('fs');
const os = require('os');
const path = require('path');
const ssbKeys = require('ssb-keys');
const mkdirp = require('mkdirp');
const manifest = require('./manifest');

const ssbPath = path.resolve(os.homedir(), '.ssb');
if (!fs.existsSync(ssbPath)) {
  mkdirp.sync(ssbPath);
}
const keys = ssbKeys.loadOrCreateSync(path.join(ssbPath, '/secret'));

const config = require('ssb-config/inject')();
config.path = ssbPath;
config.keys = keys;

require('scuttlebot/index')
  .use(require('scuttlebot/plugins/plugins'))
  .use(require('scuttlebot/plugins/master'))
  .use(require('scuttlebot/plugins/gossip'))
  .use(require('scuttlebot/plugins/replicate'))
  .use(require('ssb-friends'))
  .use(require('ssb-blobs'))
  .use(require('ssb-serve-blobs'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-private'))
  .use(require('ssb-about'))
  .use(require('ssb-contacts'))
  .use(require('ssb-query'))
  .use(require('scuttlebot/plugins/invite'))
  .use(require('scuttlebot/plugins/block'))
  .use(require('scuttlebot/plugins/local'))
  .use(require('scuttlebot/plugins/logging'))
  .call(null, config);
