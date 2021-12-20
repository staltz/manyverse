// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import 'react-native-ssb-shims';
import {run} from 'cycle-native-navigation';
import {screens, drivers} from './lib/frontend/index';
import {welcomeLayout, defaultNavOptions} from './lib/frontend/screens/layouts';
// import MessageQueue from 'react-native/Libraries/BatchedBridge/MessageQueue';

run(screens, drivers, welcomeLayout, defaultNavOptions);

// MessageQueue.spy((msg) => {
//   if (msg.module === 'WebSocketModule') return;
//   console.log(msg.type, msg.module, msg.method);
// });
