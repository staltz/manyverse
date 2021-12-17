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

rm -rf ./desktop/translations;
cp -r ./lib/backend/* ./desktop/;
cp -r ./translations/ ./desktop/translations/;
cp ./src/backend/package.json ./desktop;
cp ./src/backend/package-lock.json ./desktop;
cd ./desktop;
mv ./loader.desktop.js ./loader.js;
rm ./*.js.map;
rm ./plugins/*.js.map;
rm ./loader.mobile.js;
cd ../..;
