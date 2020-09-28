#!/bin/bash

# Any copyright is dedicated to the Public Domain.
# http://creativecommons.org/publicdomain/zero/1.0/

for f in $(git diff HEAD --name-only); do
  node --eval="\
const fs = require('fs');\
const thisYear = new Date().getFullYear();\
const filename = process.argv[1];\
if (fs.existsSync(filename)) {\
  const lines = fs.readFileSync(filename, {encoding: 'utf-8'});\
  const firstLine = lines.split('\n')[0];\
  let needsUpdating = false;\
  if (firstLine.includes('Copyright (C)')) {\
    if (!firstLine.includes(thisYear)) {\
      console.log(filename + ' needs to update the license year');\
      needsUpdating = true;\
    }\
  }\
  if (needsUpdating) {\
    process.exit(1);\
  }\
}\
  " $f || exitstatus=$?;
done

if [[ $exitstatus -ne 0 ]]; then
  exit $exitstatus;
fi