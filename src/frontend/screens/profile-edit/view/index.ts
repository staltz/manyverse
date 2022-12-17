// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
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
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {IconNames} from '~frontend/global-styles/icons';
import Button from '~frontend/components/Button';
import Avatar from '~frontend/components/Avatar';
import TopBar from '~frontend/components/TopBar';
import StatusBarBlank from '~frontend/components/StatusBarBlank';
import {State} from '../model';
import {styles, avatarSize} from './styles';

function EditAvatarButton(state: State) {
  const button = h(
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
      h(View, {style: styles.avatarTouchable, pointerEvents: 'box-only'}, [
        h(Avatar, {
          size: avatarSize,
          url: state.newAvatar
            ? `file://${state.newAvatar}`
            : state.about.imageUrl,
          style: styles.avatar,
          overlayIcon: IconNames.takePicture,
        }),
      ]),
    ],
  );

  if (Platform.OS === 'web') {
    return h(View, {style: {width: avatarSize}}, [
      h('label', {style: {width: avatarSize}, htmlFor: 'avatar_desktop'}, [
        button,
      ]),
      h('input', {
        sel: 'avatar-desktop',
        id: 'avatar_desktop',
        type: 'file',
        accept: 'image/png, image/jpeg',
        style: {display: 'none'},
        multiple: false,
      }),
    ]);
  } else {
    return button;
  }
}

export default function view(
  state$: Stream<State>,
  manageAliases$: Stream<ReactElement>,
) {
  return xs.combine(state$, manageAliases$).map(([state, manageAliases]) => {
    return h(View, {style: styles.screen}, [
      h(StatusBarBlank),
      h(TopBar, {sel: 'topbar', title: t('profile_edit.title')}),

      h(ScrollView, {style: styles.container}, [
        h(
          KeyboardAvoidingView,
          {
            style: styles.fields,
            enabled: true,
            ...Platform.select({ios: {behavior: 'padding' as const}}),
          },
          [
            h(Button, {
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

            EditAvatarButton(state),

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
              ...Platform.select({
                web: {
                  numberOfLines: 4,
                },
              }),
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
