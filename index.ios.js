// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import 'react-native-ssb-shims';
import {run} from 'cycle-native-navigation';
import {screens, drivers} from './lib/frontend/index';
import {welcomeLayout, defaultNavOptions} from './lib/frontend/screens/layouts';
import nodejs from 'nodejs-mobile-react-native';
// import './snoopy'; // Log and debug the React Native JS<-->Native Bridge

setTimeout(() => {
  nodejs.start('loader.js');
}, 1);
run(screens, drivers, welcomeLayout, defaultNavOptions);
