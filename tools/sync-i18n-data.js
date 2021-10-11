#!/usr/bin/env node

// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

const fs = require('fs');
const path = require('path');

function getByPath(obj, path) {
  let result = obj;
  for (const key of path.split('.')) {
    if (result[key]) result = result[key];
    else return '';
  }
  return result;
}

function deleteByPath(obj, path) {
  const isEmpty = (o) => Object.keys(o).length === 0;
  let context = obj;
  const keys = path.split('.');
  const lastKey = keys.pop();
  for (const key of keys) {
    if (context[key]) context = context[key];
    else return;
  }
  if (context[lastKey]) delete context[lastKey];
  if (isEmpty(context)) deleteByPath(obj, keys.join('.'));
}

function addByPath(obj, path, value) {
  let context = obj;
  const keys = path.split('.');
  const lastKey = keys.pop();
  for (const key of keys) {
    if (context[key]) context = context[key] || {};
    else context = context[key] = {};
  }
  if (!context[lastKey]) context[lastKey] = value;
}

function traverse(obj, onEach, onDone) {
  function internalTraverse(_obj, _ancestors, _onEach, _onDone) {
    for (let name in _obj) {
      if (typeof _obj[name] === 'object') {
        internalTraverse(_obj[name], _ancestors.concat(name), _onEach);
      } else if (typeof _obj[name] === 'string') {
        const key = _ancestors.concat(name).join('.');
        if (_onEach) _onEach(key);
      }
    }
    if (_onDone) _onDone();
  }
  const noop = () => {};
  internalTraverse(obj, [], onEach || noop, onDone || noop);
}

function main() {
  // Load all language JSON files
  const allFilenames = fs
    .readdirSync(path.resolve(__dirname, '../translations'))
    .filter((filename) => filename.endsWith('.json'));
  const allJSONs = new Map();
  for (const filename of allFilenames) {
    const json = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, '../translations/', filename),
        'utf8',
      ),
    );
    allJSONs.set(filename, json);
  }

  // traverse source language and collect all paths
  const SOURCE_FILENAME = 'en.json';
  const sourceJSON = allJSONs.get(SOURCE_FILENAME);
  const sourcePaths = new Set();
  traverse(sourceJSON, (path) => {
    sourcePaths.add(path);
  });

  // Update each language JSON file
  for (const filename of allFilenames) {
    if (filename === SOURCE_FILENAME) continue;

    const json = allJSONs.get(filename);
    const paths = new Set();
    // if a language path is not in the source: delete it from the language
    traverse(json, (path) => {
      paths.add(path);
      if (!sourcePaths.has(path)) deleteByPath(json, path);
    });
    // if a source path is not in the language: add it to the language
    traverse(sourceJSON, (path) => {
      if (!paths.has(path)) {
        const value = getByPath(sourceJSON, path);
        addByPath(json, path, value);
      }
    });

    // update language file
    fs.writeFileSync(
      path.resolve(__dirname, '../translations/', filename),
      JSON.stringify(json, null, 2),
      'utf8',
    );
  }
}

main();
