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

pushd ./nodejs-assets/nodejs-project/node_modules

# Remove leveldown because it's replaced by leveldown-nodejs-mobile
rm -rf leveldown
rm -rf ssb-db2/node_modules/leveldown
rm -rf ssb-friends/node_modules/leveldown

# Remove directories that have these names
find . \
  -type d \
  \( \
    -name "obj.target" \
    -o \
    -name "prebuilds" \
  \) \
  -print0 | xargs -0 rm -rf

# Remove files that have these names
find . \
  -type f \
  \( \
    -name "electron-napi.node" \
  \) \
  -print0 | xargs -0 rm -rf

popd