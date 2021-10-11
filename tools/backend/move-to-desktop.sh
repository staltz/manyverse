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

mkdir -p ./desktop;
rm -rf ./desktop/nodejs-project;
cp -r ./lib/backend ./desktop;
mv ./desktop/backend ./desktop/nodejs-project;
cp -r ./translations/ ./desktop/nodejs-project/translations/;
cp ./src/backend/package.json ./desktop/nodejs-project;
cp ./src/backend/package-lock.json ./desktop/nodejs-project;
cd ./desktop/nodejs-project;
mv ./loader.desktop.js ./loader.js;
rm ./*.js.map;
rm ./plugins/*.js.map;
rm ./loader.mobile.js;
cd ../..;
