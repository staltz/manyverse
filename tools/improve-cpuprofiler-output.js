#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const fs = require('fs');
const readline = require('readline');

const pathToProfileJson = process.argv[2];
const pathToIndexJs = process.argv[3];
if (process.argv.length !== 4) {
  console.error(
    'Usage:\n\tnode improve-cpuprofiler-output.js ' +
      '<path-to-profile.json> <path-to-nodejs-project-index.js>',
  );
  process.exit(1);
}

function measurePreludeLines(filename) {
  const bundleContent = fs.readFileSync(filename, {encoding: 'utf-8'});
  const results = bundleContent.match(/([^"]*(?=\n")){1}/);
  if (!results) return 0;
  return results[0].split('\n').length;
}

function loadBundleHashmap(filename, cb) {
  const prelude = `
(function prelude(defs, names) {
  var hashes = {};
  var hash;
  function actualname(fullname) {
    var parts = fullname.split('/').reverse()
    if (parts.length === 1) return parts[0]
    if (parts.length === 2 && parts[1] === 'plugins') return parts[0]
    while (parts[0] && parts[1] && parts[1] !== 'node_modules') parts.shift()
    return parts[0]
  }
  for (let name of Object.keys(names)) {
    hash = names[name][0];
    hashes[hash] = actualname(name);
  }
  return hashes;
})({
  `;
  const bundleContent = fs.readFileSync(filename, {encoding: 'utf-8'});
  const newBundleContent = bundleContent.replace(/([^"]*(?=\n")){1}/, prelude);
  const hashes = eval(newBundleContent);
  cb(null, hashes);
}

function loadBundleLines(filename, cb) {
  var rl = readline.createInterface({
    input: fs.createReadStream(filename, {encoding: 'utf-8'}),
  });

  const lines = [];
  rl.on('line', function(line) {
    lines.push(line);
  });

  rl.on('close', () => {
    cb(null, lines);
  });
}

function findHashAboveLine(lineNumber, lines) {
  for (let i = lineNumber; i >= 0; i--) {
    if (lines[i].match(/"[^"]{32}[^"]+":/)) {
      const hash = lines[i].replace(/"/g, '').replace(/\:$/, '');
      return hash;
    }
  }
}

function improveNames(nodes, preludeHeight, hashmap, lines) {
  for (let node of nodes) {
    if (
      node.callFrame &&
      node.callFrame.url &&
      node.callFrame.url.endsWith('nodejs-project/index.js') &&
      node.callFrame.lineNumber > preludeHeight
    ) {
      const hash = findHashAboveLine(node.callFrame.lineNumber, lines);
      const modulename = hashmap[hash] || '?';
      const goodFunctionName = node.callFrame.functionName
        .replace('module.exports', '')
        .replace('.exports.', '')
        .replace('.exports', '')
        .replace(hash, '')
        .replace(modulename, '')
        .replace(/^\.$/, '');
      const newName = !goodFunctionName
        ? modulename
        : modulename + '#' + goodFunctionName;
      node.callFrame.functionName = newName;
    }
  }
}

loadBundleLines(pathToIndexJs, (err, lines) => {
  loadBundleHashmap(pathToIndexJs, (err2, hashmap) => {
    const preludeHeight = measurePreludeLines(pathToIndexJs);
    const opts = {encoding: 'utf-8'};
    const profileJson = JSON.parse(fs.readFileSync(pathToProfileJson, opts));
    improveNames(profileJson.nodes, preludeHeight, hashmap, lines);
    fs.writeFileSync(pathToProfileJson, JSON.stringify(profileJson), opts);
  });
});
