#!/bin/bash

# SPDX-FileCopyrightText: 2021 The Manyverse Authors
#
# SPDX-License-Identifier: CC0-1.0

set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

function onFailure() {
  echo "Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}" >&2
  exit 1
}

cd ./nodejs-assets/nodejs-project;

# Why some packages are filter'd or replaced:
#   bindings: after noderify, the paths to .node files might be different, so
#      we use a special fork of bindings
#   chloride: needs special compilation configs for android, and we'd like to
#      remove unused packages such as sodium-browserify etc
#   leveldown: newer versions of leveldown are intentionally ignoring
#      nodejs-mobile support, so we run an older version
#   node-extend: can't remember why we need to replace it, build seemed to fail
#   ssb-validate2-rsjs-node: it's implemented in Rust, we want JS-only
#   non-private-ip: we use a "better" fork of this package
#   multiserver net plugin: we're fixing a corner case bug with error recovery
#   rn-bridge: this is not an npm package, it's just a nodejs-mobile shortcut
#   bl: we didn't use it, and bl@0.8.x has security vulnerabilities
#   bufferutil: because we want nodejs-mobile to load its native bindings
#   supports-color: optional dependency within package `debug`
#   electron: not used on mobile, it's specific to desktop
#   multiserver-electron-ipc: not used on mobile, it's specific to desktop
#   utf-8-validate: because we want nodejs-mobile to load its native bindings
$(npm bin)/noderify \
  --replace.bindings=bindings-noderify-nodejs-mobile \
  --replace.chloride=sodium-chloride-native-nodejs-mobile \
  --replace.leveldown=leveldown-nodejs-mobile \
  --replace.node-extend=xtend \
  --replace.ssb-validate2-rsjs-node=ssb-validate2 \
  --replace.non-private-ip=non-private-ip-android \
  --replace.multiserver/plugins/net=staltz-multiserver/plugins/net \
  --filter=rn-bridge \
  --filter=bl \
  --filter=bufferutil \
  --filter=supports-color \
  --filter=electron \
  --filter=multiserver-electron-ipc \
  --filter=utf-8-validate \
  index.js > _index.js;
rm index.js; mv _index.js index.js;

rm one-time-fixes.js;
rm restore.js;
rm ssb.js;
rm -rf plugins;

cd ../..;