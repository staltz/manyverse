// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View, TextInput, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../../drivers/localization';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import EmptySection from '../../components/EmptySection';
import AccountsListCheckMany from '../../components/AccountsListCheckMany';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import {MAX_PRIVATE_MESSAGE_RECIPIENTS} from '../../ssb/utils/constants';
import {State} from './model';
import {styles} from './styles';

export default function view(state$: Stream<State>) {
  return state$.map((state) => {
    const nextButtonEnabled = state.recipients.length > 0;

    return h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('recipients_input.title')}, [
        h(Button, {
          sel: 'recipientsInputNextButton',
          style: nextButtonEnabled
            ? styles.nextButtonEnabled
            : styles.nextButtonDisabled,
          text: t('recipients_input.call_to_action.proceed.label'),
          strong: nextButtonEnabled,
          accessible: true,
          accessibilityLabel: t(
            'recipients_input.call_to_action.proceed.accessibility_label',
          ),
        }),
      ]),

      h(View, {style: styles.mentionsOverlay}, [
        h(View, {style: styles.mentionsInputContainer}, [
          h(Icon, {
            size: Dimensions.iconSizeNormal,
            style: styles.mentionsIcon,
            color: Palette.textVeryWeak,
            name: 'account-search',
          }),
          h(TextInput, {
            style: styles.mentionsInput,
            sel: 'mentionInput',
            value: state.mentionQuery,
            accessible: true,
            accessibilityLabel: t(
              'recipients_input.fields.mention_input.accessibility_label',
            ),
            placeholder: t('recipients_input.fields.mention_input.placeholder'),
            multiline: false,
            returnKeyType: 'done',
            placeholderTextColor: Palette.textVeryWeak,
            selectionColor: Palette.backgroundTextSelection,
            underlineColorAndroid: Palette.textLine,
          }),
        ]),
        h(
          ScrollView,
          {style: styles.mentionsList, keyboardShouldPersistTaps: 'always'},
          [
            h(AccountsListCheckMany, {
              sel: 'recipients',
              accounts: state.mentionSuggestions as any,
              maximumCheckable: MAX_PRIVATE_MESSAGE_RECIPIENTS,
            }),
            state.mentionSuggestions.length
              ? null
              : state.mentionQuery.length
              ? h(EmptySection, {
                  style: styles.empty,
                  title: t('recipients_input.empty.none_to_choose.title'),
                  description: t(
                    'recipients_input.empty.none_to_choose.description',
                  ),
                })
              : h(EmptySection, {
                  style: styles.empty,
                  title: t('recipients_input.empty.instructions.title'),
                  description: t(
                    'recipients_input.empty.instructions.description',
                  ),
                }),
          ],
        ),
      ]),
    ]);
  });
}
