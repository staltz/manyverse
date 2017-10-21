#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const pkgJsonPath = path.join(__dirname, '../package.json');
const pkgJson = require(pkgJsonPath);

const manifestPath = path.join(
  __dirname,
  '../android/app/src/main/AndroidManifest.xml'
);
const manifestBefore = fs.readFileSync(manifestPath, 'utf-8');
const $ = cheerio.load(manifestBefore, {xmlMode: true});
const versionCodeBefore = parseInt($('manifest').attr('android:versionCode'));
const versionCodeAfter = versionCodeBefore + 1;

// Set versionName
$('manifest').attr('android:versionName', pkgJson.version);

// Set versionCode
$('manifest').attr('android:versionCode', versionCodeAfter);

// Write the file
fs.writeFileSync(manifestPath, $.xml(), 'utf-8');
