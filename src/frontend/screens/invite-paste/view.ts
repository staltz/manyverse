/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import {State} from './model';
import {styles} from './styles';

export default function view(state$: Stream<State>) {
  const behaviorProp = Platform.OS === 'ios' ? 'behavior' : 'IGNOREbehavior';

  return state$.map(state => {
    const acceptEnabled = state.content.length > 0;

    return h(View, {style: styles.container}, [
      h(TopBar, {sel: 'topbar'}, [
        h(Button, {
          sel: 'inviteAcceptButton',
          style: acceptEnabled
            ? styles.acceptButtonEnabled
            : styles.acceptButtonDisabled,
          text: t('call_to_action.done'),
          strong: acceptEnabled,
          accessible: true,
          accessibilityLabel: t(
            'invite_paste.call_to_action.accept.accessibility_label',
          ),
        }),
      ]),

      h(
        KeyboardAvoidingView,
        {style: styles.bodyContainer, enabled: true, [behaviorProp]: 'padding'},
        [
          h(TextInput, {
            style: styles.contentInput,
            sel: 'contentInput',
            nativeID: 'FocusViewOnResume',
            accessible: true,
            accessibilityLabel: t(
              'invite_paste.text_field.accessibility_label',
            ),
            autoFocus: true,
            multiline: true,
            returnKeyType: 'done',
            placeholder: t('invite_paste.placeholder'),
            placeholderTextColor: Palette.textVeryWeak,
            selectionColor: Palette.backgroundTextSelection,
            underlineColorAndroid: Palette.backgroundTextWeak,
          }),
        ],
      ),
    ]);
  });
}
