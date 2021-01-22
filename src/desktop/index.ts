/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {run} from '@cycle/run';
import {withState} from '@cycle/state';
import {makeReactNativeDriver} from '@cycle/react-native';
// import {makeReactNativeDriver, View, Text, Button} from '@cycle/react-native';
import {AppRegistry} from 'react-native';
import {asyncStorageDriver} from 'cycle-native-asyncstorage';
// import makeClient from './ssb/client';
import {ssbDriver} from '../frontend/drivers/ssb';
// import {dialogDriver} from '../frontend/drivers/dialogs';
import {thread} from '../frontend/screens/thread';
// import threadView from '../frontend/screens/thread/view';

// function main(sources: any) {
//   const inc = Symbol();
//   const inc$ = sources.react.select(inc).events('press');
//
//   const count$ = inc$.fold((count: number) => count + 1, 0);
//
//   // makeClient().then((ssb) => {
//   //   ssb.whoami((err: any, {id}: {id: string}) => {
//   //     console.log('whoami', id);
//   //   });
//   // });
//
//   const vdom$ = count$.map((i: number) =>
//     View([
//       Text(`Counter: ${i}`),
//       Button(inc, {
//         title: 'Increment',
//         onPress: () => {},
//       }),
//     ]),
//   );
//
//   //const vdom$ =
//
//   return {
//     // react: vdom$,
//   };
// }

// function main(sources: any) {
//   const vdom$ = threadView(sources, {
//     willReply$: xs.never(),
//     focusTextInput$: xs.never(),
//   });
//   return {
//     screen: vdom$,
//   };
// }

run(withState(thread), {
  screen: makeReactNativeDriver('manyverse'),
  asyncstorage: asyncStorageDriver,
  ssb: ssbDriver,
  dialog: (x: any) => ({
    alert: () => xs.never() as any,
    showPicker: () => xs.never() as any,
  }),
  props: (x: any) =>
    xs.of({
      selfFeedId: '@Vz6v3xKpzViiTM/GAe+hKkACZSqrErQQZgv4iqQxEn8=.ed25519',
      lastSessionTimestamp: 0,
      rootMsgId: '%vdPBFaZbVnlWHxGdN0giPaHTh4BQgTmj8lb039N510g=.sha256',
    }),
  navigation: (x: any) =>
    ({
      backPress: () => xs.never() as any,
      globalDidDisappear: () => xs.never() as any,
    } as any),
  keyboard: (x: any) => ({
    events: () => xs.never() as any,
  }),
} as any);
AppRegistry.runApplication('manyverse', {
  rootTag: document.getElementById('app'),
});
