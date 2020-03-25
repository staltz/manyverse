/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View, Text} from 'react-native';
import {Palette} from '../../global-styles/palette';
import HeaderButton from '../../components/HeaderButton';
import TopBar from '../../components/TopBar';
import {State} from './model';
import {styles} from './styles';

export default function view(state$: Stream<State>) {
  return state$.map(state =>
    h(View, {style: styles.container}, [
      h(TopBar, {sel: 'topbar'}, [
        h(HeaderButton, {
          sel: 'inviteShareButton',
          icon: 'share',
          accessibilityLabel: 'Share Button',
          side: 'right',
        }),
      ]),

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
            selectionColor: Palette.backgroundTextSelection,
          },
          state.inviteCode ?? 'loading...',
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
