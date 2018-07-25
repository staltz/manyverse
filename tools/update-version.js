#!/usr/bin/env node
const ReactNativeVersion = require('react-native-version');
const versiony = require('versiony');
const readline = require('readline');
const path = require('path');

const currentVersion = versiony.from('./package.json').get();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('The current version is...        ' + currentVersion);
rl.question('What should the next version be? ', nextVersion => {
  versiony.version(nextVersion).to('./package.json');
  versiony.version(nextVersion).to('./package-lock.json');
  ReactNativeVersion.version(
    {
      neverAmend: true,
      target: 'android',
    },
    path.resolve(__dirname, '../'),
  ).catch(err => {
    console.error(err);
    process.exit(1);
  });

  rl.close();
});
