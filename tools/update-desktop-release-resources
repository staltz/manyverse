#!/bin/bash

# SPDX-FileCopyrightText: 2023 The Manyverse Authors
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

if [[ "$OSTYPE" == "darwin"* ]]; then
  RESOURCES_DIR=desktop/outputs/linux-unpacked/resources/app # TODO: fix this
else
  RESOURCES_DIR=desktop/outputs/linux-unpacked/resources/app
fi

if [[ ! -d "$RESOURCES_DIR" ]]; then
  echo "Desktop release resources does not exist at $RESOURCES_DIR"
  exit 1
fi

# rm -rf "$RESOURCES_DIR/renderer-dist"
# rm -rf "$RESOURCES_DIR/translations"
# rm -rf "$RESOURCES_DIR/index.html"
# rm -rf "$RESOURCES_DIR/package.json"
# rm $RESOURCES_DIR/*.js

cp -r desktop/renderer-dist "$RESOURCES_DIR/"
cp -r desktop/translations "$RESOURCES_DIR/"
cp desktop/index.html "$RESOURCES_DIR/"
cp desktop/package.json "$RESOURCES_DIR/"
cp desktop/*.js "$RESOURCES_DIR/"