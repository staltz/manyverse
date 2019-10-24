/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'react-native-ssb-shims';
import {run} from 'cycle-native-navigation';
import {
  screens,
  drivers,
  welcomeLayout,
  defaultNavOptions,
} from './lib/frontend/index';
// import './snoopy'; // Log and debug the React Native JS<-->Native Bridge

run(screens, drivers, welcomeLayout, defaultNavOptions);
