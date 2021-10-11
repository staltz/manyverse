#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const fs = require('fs');

const pathToIndexJs = process.argv[2];
if (process.argv.length !== 3) {
  console.error('Usage:\n\tnode analyse-backend-bundle.js <path-to-index.js>');
  process.exit(1);
}

const prelude = `
(function prelude(defs, names) {
  var sizes = [];
  var fn;
  var hash;
  for (let name of Object.keys(names)) {
    hash = names[name][0];
    fn = defs[hash];
    if (!fn) {
      console.log('undefined implementation for ' + name);
      continue;
    }
    sizes.push([name, fn.toString().length]);
  }
  sizes.sort(function(a, b) {
    return a[1] - b[1];
  });
  console.log('\\n');
  for (let pair of sizes) {
    console.log(pair[1] + '\\t' + pair[0]);
  }
})({
`;

const content = fs.readFileSync(pathToIndexJs, {encoding: 'utf-8'});
const newContent = content.replace(/([^"]*(?=\n")){1}/, prelude);

eval(newContent);
