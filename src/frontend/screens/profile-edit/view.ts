/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {h} from '@cycle/react';
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '../../components/Button';
import {Palette} from '../../global-styles/palette';
import {State} from './model';
import {styles, avatarSize} from './styles';
import {ReactElement} from 'react';
import Avatar from '../../components/Avatar';

export default function view(
  state$: Stream<State>,
  topBarElem$: Stream<ReactElement<any>>,
) {
  return xs.combine(state$, topBarElem$).map(([state, topBarElem]) => {
    const defaultName: string = state.about.name ?? '';

    const behaviorProp = Platform.OS === 'ios' ? 'behavior' : 'IGNOREbehavior';

    return h(View, {style: styles.container}, [
      topBarElem,

      h(View, {style: styles.cover}),

      h(
        TouchableWithoutFeedback,
        {
          sel: 'avatar',
          accessible: true,
          accessibilityLabel: 'Profile Picture',
        },
        [
          h(View, {style: styles.avatarTouchable, pointerEvents: 'box-only'}, [
            h(Avatar, {
              size: avatarSize,
              url: state.newAvatar
                ? `file://${state.newAvatar}`
                : state.about.imageUrl,
              style: styles.avatar,
              overlayIcon: 'camera',
            }),
          ]),
        ],
      ),

      Platform.OS === 'ios'
        ? null
        : h(Button, {
            sel: 'save',
            style: styles.save,
            strong: true,
            text: 'SAVE',
            accessible: true,
            accessibilityLabel: 'Save Profile Button',
          }),

      h(
        KeyboardAvoidingView,
        {style: styles.fields, enabled: true, [behaviorProp]: 'padding'},
        [
          Platform.OS === 'ios'
            ? h(Button, {
                sel: 'save',
                style: styles.save,
                strong: true,
                text: 'SAVE',
                accessible: true,
                accessibilityLabel: 'Save Profile Button',
              })
            : null,

          h(Text, {style: styles.label}, 'Name'),
          h(TextInput, {
            sel: 'name',
            multiline: false,
            autoFocus: true,
            defaultValue: defaultName,
            underlineColorAndroid: Palette.backgroundBrand,
            accessible: true,
            accessibilityLabel: 'Name Text Input',
            style: styles.textInput,
          }),

          h(Text, {style: styles.label}, 'Bio'),
          h(TextInput, {
            sel: 'description',
            multiline: true,
            autoFocus: false,
            numberOfLines: 1,
            defaultValue: state.about.description ?? '',
            underlineColorAndroid: Palette.backgroundBrand,
            accessible: true,
            accessibilityLabel: 'Description Text Input',
            style: styles.textInput,
          }),
        ],
      ),
    ]);
  });
}
