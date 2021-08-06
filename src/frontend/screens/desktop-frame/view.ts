/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {h} from '@cycle/react';
import {PureComponent, ReactElement} from 'react';
import {View} from 'react-native';
import {styles} from './styles';
import PublicTabIcon from '../../components/tab-buttons/PublicTabIcon';
import PrivateTabIcon from '../../components/tab-buttons/PrivateTabIcon';
import ActivityTabIcon from '../../components/tab-buttons/ActivityTabIcon';
import ConnectionsTabIcon from '../../components/tab-buttons/ConnectionsTabIcon';
import {State} from './model';

class TopBarStub extends PureComponent {
  public render() {
    return h(View, {style: styles.topBarStub});
  }
}

export default function view(
  state$: Stream<State>,
  children$: Stream<Array<ReactElement>>,
  localizationLoaded$: Stream<boolean>,
) {
  return xs
    .combine(state$, children$, localizationLoaded$.take(1))
    .map(([state, children]) =>
      h(View, {style: styles.screen}, [
        h(View, {style: styles.left}, [
          h(TopBarStub),

          h(View, {style: styles.leftMenu}, [
            h(PublicTabIcon, {
              style: styles.leftMenuTabButton,
              isSelected: state.currentTab === 'public',
              numOfUpdates: 0,
            }),
            h(PrivateTabIcon, {
              style: styles.leftMenuTabButton,
              isSelected: state.currentTab === 'private',
              numOfUpdates: 0,
            }),
            h(ActivityTabIcon, {
              style: styles.leftMenuTabButton,
              isSelected: state.currentTab === 'activity',
              numOfUpdates: 0,
            }),
            h(ConnectionsTabIcon, {
              style: styles.leftMenuTabButton,
              isSelected: state.currentTab === 'connections',
              offline: false,
              numConnected: 0,
              numStaged: 0,
            }),
          ]),
        ]),

        h(View, {style: styles.centerAndRight}, [...children]),
      ]),
    );
}
