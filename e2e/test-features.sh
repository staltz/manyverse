#!/usr/bin/env bash
SETTINGS="$(pwd)/.calabash_settings"
APK_RELEASE="$(pwd)/../android/app/build/outputs/apk/app-release.apk"
APK_DEBUG="$(pwd)/../android/app/build/outputs/apk/app-release.apk"

exitcode=0
if [[ -e "$SETTINGS" && -e "$APK_RELEASE" ]]; then
    calabash-android run $APK_RELEASE || exitcode=$?
elif [[ -e "$APK_DEBUG" ]]; then
    calabash-android run $APK_DEBUG || exitcode=$?
else
    echo "ERROR: you need to build the apk $APK before running tests."
    exitcode=1
fi

exit $exitcode
