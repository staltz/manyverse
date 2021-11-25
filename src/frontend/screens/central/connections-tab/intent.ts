// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';

export default function intent(reactSource: ReactSource, navSource: NavSource) {
  const goBack$ = navSource.backPress();

  const goToConnectionsPanel$ = reactSource
    .select('connections-panel')
    .events('press');

  return {
    goToConnectionsPanel$,
    goBack$,
  };
}
