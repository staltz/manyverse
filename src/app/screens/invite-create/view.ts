/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View, Text} from 'react-native';
import {styles} from './styles';
import {Palette} from '../../global-styles/palette';
import {ReactElement} from 'react';
import {State} from './model';

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  return xs.combine(state$, topBar$).map(([state, topBar]) =>
    h(View, {style: styles.container}, [
      topBar,
      h(View, {style: styles.bodyContainer}, [
        h(Text, {style: styles.about, textBreakStrategy: 'simple'}, [
          'GIVE THIS INVITE CODE TO ' as any,
          h(Text, {style: styles.bold}, 'ONE'),
          ' FRIEND' as any,
        ]),
        h(
          Text,
          {
            style: styles.inviteCode,
            accessible: true,
            accessibilityLabel: 'Invite Code',
            selectable: true,
            selectionColor: Palette.indigo3,
          },
          state.inviteCode || 'loading...',
        ),
        h(Text, {style: styles.about, textBreakStrategy: 'simple'}, [
          'YOU WILL SYNC WHEN YOU ARE ' as any,
          h(Text, {style: styles.bold}, 'BOTH'),
          ' ONLINE' as any,
        ]),
      ]),
    ]),
  );
}
