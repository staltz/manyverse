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

declare -a archs=(
  "armeabi-v7a"
  "arm64-v8a"
  # "x86"
  # "x86_64"
)

for arch in "${archs[@]}"
do
  pushd ./android/build/nodejs-native-assets/nodejs-native-assets-$arch

  # Remove obj.target directories
  find . \
    -type d \
    -name "obj.target" \
    -print0 | xargs -0 rm -rf
  # Update dir.list file
  sed -i '/obj\.target/d' dir.list
  # Update file.list file
  sed -i '/obj\.target/d' file.list

  # Remove native/target (neon modules) directories
  find . \
    -type d \
    -name "target" \
    -print0 | xargs -0 rm -rf
  # Update dir.list file
  sed -i '/native\/target/d' dir.list
  # Update file.list file
  sed -i '/native\/target/d' file.list

  popd
done
