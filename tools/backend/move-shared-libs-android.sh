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

# "NDK_ARCH;NODEJS_ARCH"
declare -a archs=(
  "armeabi-v7a;arm"
  "arm64-v8a;arm64"
  # "x86;x86"
  # "x86_64;x64"
)

for entry in "${archs[@]}"
do
  IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
  arch="${arr[0]}"
  nodearch="${arr[1]}"

  mkdir -p android/app/src/main/jniLibs/$arch;

  # Copy libsodium.so because nodejs-mobile scripts only move .node files
  cp ./nodejs-assets/nodejs-project/node_modules/sodium-native-nodejs-mobile/lib/android-$nodearch/libsodium.so \
    android/app/src/main/jniLibs/$arch/libsodium.so;
done
