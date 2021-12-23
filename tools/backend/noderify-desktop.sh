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

cd ./desktop;

# Why some packages are filter'd or replaced:
#   node-extend: can't remember why we need to replace it, build seemed to fail
#   ssb-keys: we use ssb-keys-neon for better performance in Rust
#   ssb-keys-mnemonic: we use ssb-keys-mnemonic-neon for better performance
#   non-private-ip: we use a "better" fork of this package
#   multiserver net plugin: we're fixing a corner case bug with error recovery
#   ssb-validate2-rsjs-node: this module doesnt yet support Electron
#   electron: we want to load its native bindings
#   rn-bridge: not used on desktop, it's specific to mobile
#   multiserver-rn-channel: not used on desktop, it's specific to mobile
#   bufferutil: because we want to load its native bindings
#   utf-8-validate: because we want to load its native bindings
$(npm bin)/noderify \
  --replace.node-extend=xtend \
  --replace.ssb-keys=ssb-keys-neon \
  --replace.ssb-keys-mnemonic=ssb-keys-mnemonic-neon \
  --replace.non-private-ip=non-private-ip-android \
  --replace.multiserver/plugins/net=staltz-multiserver/plugins/net \
  --replace.ssb-validate2-rsjs-node=ssb-validate2 \
  --filter=electron \
  --filter=rn-bridge \
  --filter=multiserver-rn-channel \
  --filter=bufferutil \
  --filter=utf-8-validate \
  index.js > _index.js;
rm index.js; mv _index.js index.js;

rm one-time-fixes.js;
rm restore.js;
rm ssb.js;
rm -rf plugins;

cd ../..;
