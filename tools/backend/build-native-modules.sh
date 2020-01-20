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

# "NDK_ARCH;NODEJS_ARCH"
declare -a archs=(
  "armeabi-v7a;arm"
  "arm64-v8a;arm64"
  # "x86;x86"
  # "x86_64;x64"
)

cd android;
if [ -f ./gradlew ]
then
  GRADLE_EXEC="./gradlew"
else
  GRADLE_EXEC="gradle"
fi
echo $GRADLE_EXEC;
for entry in "${archs[@]}"
do
  IFS=";" read -r -a arr <<< "${entry}" # entry.split(';')
  arch="${arr[0]}"

  echo "Building native modules for $arch...";
  $GRADLE_EXEC nodejs-mobile-react-native:GenerateNodeNativeAssetsLists$arch
done
cd ..;
