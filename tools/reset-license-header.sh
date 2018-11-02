#!/bin/bash

# Any copyright is dedicated to the Public Domain.
# http://creativecommons.org/publicdomain/zero/1.0/

# find ./src/**/*.ts \
#   -type f \
#   -print0 | xargs -0 -I % sh -c 'tail -n +20; command2; ...' tail -n +20

for f in $(find ./src/ -name '*.ts' -or -name '*.js'); do
  tail -n +20 $f > $f.2
  rm $f;
  cat ./tools/license-header.txt $f.2 > $f;
  rm $f.2;
done