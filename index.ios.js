// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import 'react-native-ssb-shims';
import {URL, URLSearchParams} from 'react-native-url-polyfill';
globalThis.URL = URL;
globalThis.URLSearchParams = URLSearchParams;
import {run} from 'cycle-native-navigation';
import {screens, drivers} from './lib/frontend/index';
import {welcomeLayout, defaultNavOptions} from './lib/frontend/screens/layouts';
import nodejs from 'nodejs-mobile-react-native';
import setupSentryMobile from './setup-sentry-mobile';
// import './snoopy'; // Log and debug the React Native JS<-->Native Bridge

setTimeout(() => {
  nodejs.start('loader.js');
}, 1);
run(screens, drivers, welcomeLayout, defaultNavOptions);

setupSentryMobile();
