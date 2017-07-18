#!/usr/bin/env bash
APK="$(pwd)/build/outputs/apk/app-debug.apk"
if [ -e "$APK" ]; then
    calabash-android run $APK
else
    echo "ERROR: you need to build the apk $APK before running tests."
fi