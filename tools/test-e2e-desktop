#!/bin/bash

# SPDX-FileCopyrightText: 2022 The Manyverse Authors
#
# SPDX-License-Identifier: CC0-1.0

function cleanUp {
  if [ -f "appium-server.pid" ]; then
    if ps -p $(cat appium-server.pid) >/dev/null; then
      kill -KILL $(cat appium-server.pid)
    fi
    rm appium-server.pid
    rm appium.log
  fi
}

set -eEu -o pipefail
shopt -s extdebug
IFS=$'\n\t'
trap 'onFailure $?' ERR
trap cleanUp EXIT

function onFailure() {
  echo "Unhandled script error $1 at ${BASH_SOURCE[0]}:${BASH_LINENO[0]}" >&2
  exit 1
}

if [[ "$OSTYPE" == "darwin"* ]]; then
  RELEASE_DESKTOP_SUFFIX="macos"
  EXECUTABLE_FILE=desktop/outputs/mac/Manyverse.app/Contents/MacOS/Manyverse
else
  RELEASE_DESKTOP_SUFFIX="linux"
  EXECUTABLE_FILE=desktop/outputs/linux-unpacked/manyverse
fi

if [[ -f "$EXECUTABLE_FILE" ]]; then
  echo "Desktop build already exists"
else
  echo "Desktop build does not exist, building now"
  EB_PUBLISH=never npm run release-desktop-"$RELEASE_DESKTOP_SUFFIX"
fi

rm -rf "$TMPDIR/manyverse-e2e-test"

$(npm bin)/playwright test
