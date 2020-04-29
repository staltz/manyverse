/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'react-native-ssb-shims';
import {run} from 'cycle-native-navigation';
import {screens, drivers} from './lib/frontend/index';
import {welcomeLayout, defaultNavOptions} from './lib/frontend/layouts';
import nodejs from 'nodejs-mobile-react-native';
// import './snoopy'; // Log and debug the React Native JS<-->Native Bridge

setTimeout(() => {
  nodejs.start('loader.js');
}, 1);
run(screens, drivers, welcomeLayout, defaultNavOptions);
