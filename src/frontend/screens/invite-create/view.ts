/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View, Text} from 'react-native';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import HeaderButton from '../../components/HeaderButton';
import TopBar from '../../components/TopBar';
import {State} from './model';
import {styles} from './styles';

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

export default function view(state$: Stream<State>) {
  return state$.map(state =>
    h(View, {style: styles.container}, [
      h(TopBar, {sel: 'topbar'}, [
        h(HeaderButton, {
          sel: 'inviteShareButton',
          icon: 'share',
          accessibilityLabel: t(
            'invite_create.call_to_action.share.accessibility_label',
          ),
          side: 'right',
        }),
      ]),

      h(View, {style: styles.bodyContainer}, [
        h(Text, {style: styles.about, textBreakStrategy: 'simple'}, [
          t('invite_create.share_info.1_normal'),
          bold(t('invite_create.share_info.2_bold')),
          t('invite_create.share_info.3_normal'),
        ]),
        h(
          Text,
          {
            style: styles.inviteCode,
            accessible: true,
            accessibilityRole: 'text',
            accessibilityLabel: t(
              'invite_create.invite_code.accessibility_label',
            ),
            selectable: true,
            selectionColor: Palette.backgroundTextSelection,
          },
          state.inviteCode ?? t('invite_create.loading'),
        ),
        h(Text, {style: styles.about, textBreakStrategy: 'simple'}, [
          t('invite_create.sync_info.1_normal'),
          bold(t('invite_create.sync_info.2_bold')),
          t('invite_create.sync_info.3_normal'),
        ]),
      ]),
    ]),
  );
}
