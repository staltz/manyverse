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

mkdir -p ./nodejs-assets/nodejs-project;
mv ./nodejs-assets/nodejs-project/README.md ./NODEJS-ASSETS-README.md;
rm -rf ./nodejs-assets/nodejs-project;
if [ -f ./nodejs-assets/BUILD_NATIVE_MODULES.txt ]
then
  echo -en " Build Native Modules already on";
else
  echo '1' >./nodejs-assets/BUILD_NATIVE_MODULES.txt;
  echo -en " Build Native Modules turned on";
fi
cp -r ./lib/backend ./nodejs-assets;
mv ./nodejs-assets/backend ./nodejs-assets/nodejs-project;
mkdir -p ./nodejs-assets/nodejs-project/patches;
cp ./src/backend/patches/* ./nodejs-assets/nodejs-project/patches/;
cp ./src/backend/package.json ./nodejs-assets/nodejs-project;
cp ./src/backend/package-lock.json ./nodejs-assets/nodejs-project;
cd ./nodejs-assets/nodejs-project;
mv ./loader.mobile.js ./loader.js;
rm ./*.js.map;
rm ./plugins/*.js.map;
rm ./loader.desktop.js;
cd ../..;
mv ./NODEJS-ASSETS-README.md ./nodejs-assets/nodejs-project/README.md;
