/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {setupReusable} from '@cycle/run';
import {withState} from '@cycle/state';
import {makeReactNativeDriver} from '@cycle/react-native';
import {AppRegistry} from 'react-native';
import {asyncStorageDriver} from 'cycle-native-asyncstorage';
import {ssbDriver} from './lib/frontend/drivers/ssb';
// import {dialogDriver} from './lib/frontend/drivers/dialogs';
import {makeFSDriver} from './lib/frontend/drivers/fs';
import {makeEventBusDriver} from './lib/frontend/drivers/eventbus';
import {makeLocalizationDriver} from './lib/frontend/drivers/localization';
import {global} from './lib/frontend/screens/global';
import {central} from './lib/frontend/screens/central';
const iconFont = require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf');

const iconFontStyles = `@font-face {
   src: url(dist/${iconFont});
   font-family: MaterialCommunityIcons;
 }`;
const style = document.createElement('style');
style.appendChild(document.createTextNode(iconFontStyles));
document.head.appendChild(style);

const appKey = 'manyverse';

const engine = setupReusable({
  asyncstorage: asyncStorageDriver,
  ssb: ssbDriver,
  screen: makeReactNativeDriver(appKey),
  fs: makeFSDriver(),
  navigation: (x) => ({
    backPress: () => xs.never(),
    globalDidDisappear: () => xs.never(),
    globalDidAppear: () => xs.never(),
  }),
  network: () => ({
    bluetoothIsEnabled: () => xs.of(false),
    wifiIsEnabled: () => xs.of(true),
    hasInternetConnection: () => xs.of(true),
  }),
  appstate: () => xs.of('active'),
  orientation: () => xs.never(),
  globalEventBus: makeEventBusDriver(),
  linking: () => xs.never(),
  dialog: (x) => ({
    alert: () => xs.never(),
    prompt: () => xs.never(),
    showPicker: () => xs.never(),
  }),
  localization: makeLocalizationDriver(),
  keyboard: (x) => ({
    events: () => xs.never(),
  }),
});

engine.run(withState(global)(engine.sources));
engine.run(
  withState(central)({
    ...engine.sources,
  }),
);
AppRegistry.runApplication(appKey, {
  rootTag: document.getElementById('app'),
});
