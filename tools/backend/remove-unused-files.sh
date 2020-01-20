#!/bin/bash

# Any copyright is dedicated to the Public Domain.
# http://creativecommons.org/publicdomain/zero/1.0/

set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR

function onFailure() {
  echo "Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}" >&2
  exit 1
}

# make a list of things to delete then delete them
# `-exec rm -rf {} \;` confuses find because the recursion can no longer find a step (depth-first traversal (-d) would also work)
# GNU find and modern BSD/macOS find have a `-delete` operator
find ./nodejs-assets/nodejs-project/node_modules \
  -type d \
  \( \
    -name "darwin-x64" \
    -o -name "win32-ia32" \
    -o -name "win32-x64" \
  \) \
  -print0 | xargs -0 rm -rf # delete everything in the list
find ./nodejs-assets/nodejs-project/node_modules \
  -type f \
  \( \
    -name "electron-napi.node" \
  \) \
  -print0 | xargs -0 rm -rf # delete everything in the list
