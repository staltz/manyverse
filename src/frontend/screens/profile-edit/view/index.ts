// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {t} from '../../../drivers/localization';
import {Palette} from '../../../global-styles/palette';
import Button from '../../../components/Button';
import Avatar from '../../../components/Avatar';
import TopBar from '../../../components/TopBar';
import {State} from '../model';
import {styles, avatarSize} from './styles';

export default function view(
  state$: Stream<State>,
  manageAliases$: Stream<ReactElement>,
) {
  return xs.combine(state$, manageAliases$).map(([state, manageAliases]) => {
    return h(View, {style: styles.container}, [
      h(TopBar, {sel: 'topbar', title: t('profile_edit.title')}),

      h(ScrollView, {style: styles.container}, [
        h(View, {style: styles.cover}),

        h(
          TouchableWithoutFeedback,
          {
            sel: 'avatar',
            accessible: true,
            accessibilityRole: 'button',
            accessibilityLabel: t(
              'profile_edit.call_to_action.edit_picture.accessibility_label',
            ),
          },
          [
            h(
              View,
              {style: styles.avatarTouchable, pointerEvents: 'box-only'},
              [
                h(Avatar, {
                  size: avatarSize,
                  url: state.newAvatar
                    ? `file://${state.newAvatar}`
                    : state.about.imageUrl,
                  style: styles.avatar,
                  overlayIcon: 'camera',
                }),
              ],
            ),
          ],
        ),

        Platform.OS === 'ios'
          ? null
          : h(Button, {
              sel: 'save',
              style: styles.save,
              textStyle: styles.saveText,
              strong: true,
              text: t('profile_edit.call_to_action.save.label'),
              accessible: true,
              accessibilityLabel: t(
                'profile_edit.call_to_action.save.accessibility_label',
              ),
            }),

        h(
          KeyboardAvoidingView,
          {
            style: styles.fields,
            enabled: true,
            ...Platform.select({ios: {behavior: 'padding' as const}}),
          },
          [
            Platform.OS === 'ios'
              ? h(Button, {
                  sel: 'save',
                  style: styles.save,
                  textStyle: styles.saveText,
                  strong: true,
                  text: t('profile_edit.call_to_action.save.label'),
                  accessible: true,
                  accessibilityLabel: t(
                    'profile_edit.call_to_action.save.accessibility_label',
                  ),
                })
              : null,

            h(Text, {style: styles.label}, t('profile_edit.fields.name.label')),
            h(TextInput, {
              sel: 'name',
              multiline: false,
              autoFocus: true,
              defaultValue: state.about.name ?? '',
              underlineColorAndroid: Palette.brandMain,
              accessible: true,
              accessibilityLabel: t(
                'profile_edit.fields.name.accessibility_label',
              ),
              style: styles.textInput,
            }),

            h(
              Text,
              {style: styles.label},
              t('profile_edit.fields.description.label'),
            ),
            h(TextInput, {
              sel: 'description',
              multiline: true,
              autoFocus: false,
              // numberOfLines: 1,
              scrollEnabled: false,
              defaultValue: state.about.description ?? '',
              underlineColorAndroid: Palette.brandMain,
              accessible: true,
              accessibilityLabel: t(
                'profile_edit.fields.description.accessibility_label',
              ),
              style: styles.textInput,
            }),

            h(
              Text,
              {style: styles.label},
              t('profile_edit.fields.aliases.label'),
            ),
            manageAliases,
          ],
        ),
      ]),
    ]);
  });
}
