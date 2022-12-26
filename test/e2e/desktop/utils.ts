// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: CC0-1.0

import fs from 'fs';
import os from 'os';
import path from 'path';
import {test} from '@playwright/test';
import {findLatestBuild, parseElectronApp} from 'electron-playwright-helpers';
import {ElectronApplication, _electron as electron} from 'playwright-core';
const caps = require('ssb-caps');
const ssbDB2 = require('ssb-db2');
const ssbKeys = require('ssb-keys');
const SecretStack = require('secret-stack');

const sessionDir = path.join(os.tmpdir(), 'manyverse-e2e-test');
if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir);
}

type Task = (path: string) => Promise<void>;

export default function setup(subtest?: string, pretask?: Task) {
  const ctx = {} as {electronApp?: ElectronApplication};

  test.beforeAll(async () => {
    const latestBuild = findLatestBuild('desktop/outputs');

    const MV_USER_DATA = path.join(sessionDir, subtest ?? 'default');
    if (pretask) await pretask(MV_USER_DATA);

    // parse the directory and find paths and other info
    const originalConsoleLog = console.log;
    console.log = () => {};
    const appInfo = parseElectronApp(latestBuild);
    console.log = originalConsoleLog;
    if (!appInfo.arch) appInfo.arch = 'x64';
    if (
      appInfo.platform === 'linux' &&
      !appInfo.executable.endsWith('/manyverse')
    ) {
      appInfo.executable += '/manyverse';
    }

    // Execute
    ctx.electronApp = await electron.launch({
      args: [appInfo.main],
      env: {...process.env, MV_USER_DATA},
      executablePath: appInfo.executable,
      locale: 'en',
    });
  });

  test.afterAll(async () => {
    // We should do `await electronApp.close()` but we have problems with
    // terminating the worker_threads instance, so we use an overkill instead.
    ctx.electronApp?.process().kill('SIGKILL');
  });

  return ctx;
}

export function stageDatabase(mvPath: string) {
  if (!fs.existsSync(mvPath)) fs.mkdirSync(mvPath);
  const ssbPath = path.join(mvPath, 'ssb');
  if (!fs.existsSync(ssbPath)) fs.mkdirSync(ssbPath);
  const secretPath = path.join(ssbPath, 'secret');
  const keys = ssbKeys.loadOrCreateSync(secretPath);
  return SecretStack({appKey: caps.shs})
    .use(ssbDB2)
    .call(null, {path: ssbPath, keys});
}
