#!/usr/bin/env node
const ReactNativeVersion = require('react-native-version');
const readline = require('readline');
const leftPad = require('left-pad');
const path = require('path');
const fs = require('fs');

const currentVersion = JSON.parse(fs.readFileSync('./package.json')).version;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function createTodaysVersion(attempt) {
  const today = new Date();
  const yy = today.getFullYear() - 2000; // So it's two digits
  const m = today.getMonth() + 1;
  const d = leftPad(today.getDate(), 2, '0');
  if (attempt === 0) {
    return `0.${yy}.${m}-${d}.beta`;
  } else {
    const letter = String.fromCharCode(97 + attempt); // 0=a, 1=b, 2=c, ...
    return `0.${yy}.${m}-${d}${letter}.beta`;
  }
}

let nextVersion;
for (let i = 0 /* letter a */; i <= 25 /* letter z */; i++) {
  nextVersion = createTodaysVersion(i);
  if (nextVersion !== currentVersion) break;
}
if (nextVersion === currentVersion) {
  console.error('I dont know what else to generate beyong ' + nextVersion);
  process.exit(1);
}

rl.question('Next version will be `' + nextVersion + '`, okay? y/n ', yn => {
  if (yn !== 'y' && yn !== 'Y') {
    console.log('Release cancelled.\n');
    process.exit(1);
    return;
  }

  const pkgJSON = JSON.parse(fs.readFileSync('./package.json'));
  const pkgLockJSON = JSON.parse(fs.readFileSync('./package-lock.json'));
  pkgJSON.version = nextVersion;
  pkgLockJSON.version = nextVersion;
  fs.writeFileSync('./package.json', JSON.stringify(pkgJSON, null, 2));
  fs.writeFileSync('./package-lock.json', JSON.stringify(pkgLockJSON, null, 2));

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
