#!/bin/bash

# SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
#
# SPDX-License-Identifier: CC0-1.0

function cleanUp {
  if [ -f "appium-server.pid" ]; then
    if ps -p $(cat appium-server.pid)> /dev/null; then
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

pushd android/app/build/outputs/apk/indie/release
cp app-indie-release.apk app-indie-release-e2e.apk
appurl=$(curl -u "$MANYVERSE_BROWSERSTACK_USER:$MANYVERSE_BROWSERSTACK_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@app-indie-release-e2e.apk")
popd

$(npm bin)/appium --port 4995 > appium.log & echo $! > appium-server.pid
sleep 5
BROWSERSTACK_APP_URL=$appurl $(npm bin)/tape test/smoke/android/index.js | $(npm bin)/tap-spec
