/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {run} from '@cycle/run';
import {makeReactNativeDriver, View, Text, Button} from '@cycle/react-native';
import {AppRegistry} from 'react-native';
import makeClient from './ssb/client';

function main(sources: any) {
  const inc = Symbol();
  const inc$ = sources.react.select(inc).events('press');

  const count$ = inc$.fold((count: number) => count + 1, 0);

  makeClient().then((ssb) => {
    ssb.whoami((err: any, {id}: {id: string}) => {
      console.log('whoami', id);
    });
  });

  const vdom$ = count$.map((i: number) =>
    View([
      Text(`Counter: ${i}`),
      Button(inc, {
        title: 'Increment',
        onPress: () => {},
      }),
    ]),
  );

  return {
    react: vdom$,
  };
}

run(main, {
  react: makeReactNativeDriver('manyverse'),
});
AppRegistry.runApplication('manyverse', {
  rootTag: document.getElementById('app'),
});
