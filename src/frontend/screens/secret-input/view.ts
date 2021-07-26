/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
} from 'react-native';
import {h} from '@cycle/react';
import {t} from '../../drivers/localization';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import Button from '../../components/Button';
import FlagSecure from '../../components/FlagSecure';
import TopBar from '../../components/TopBar';
import {State} from './model';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  inputField: {
    flex: 1,
    alignSelf: 'stretch',
    marginTop: Dimensions.verticalSpaceBig,
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: Dimensions.borderRadiusSmall,
    textAlign: 'left',
    textAlignVertical: 'top',
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyMonospace,
    fontWeight: Platform.select({ios: '500', default: 'normal'}),
    color: Palette.textWeak,
    backgroundColor: Palette.backgroundTextWeak,
  },

  bold: {
    fontWeight: 'bold',
  },

  topDescription: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingTop: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  ctaButton: {
    backgroundColor: Palette.backgroundCTA,
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceBig,
    alignSelf: 'center',
  },
});

export default function view(state$: Stream<State>) {
  return state$.map((state) =>
    h(View, {style: styles.screen}, [
      h(TopBar, {
        sel: 'topbar',
        title: state.practiceMode
          ? t('secret_input.practice.title')
          : t('secret_input.restore.title'),
      }),

      h(
        KeyboardAvoidingView,
        {
          style: styles.container,
          enabled: true,
          ...Platform.select({ios: {behavior: 'padding' as const}}),
        },
        [
          h(FlagSecure, [
            h(
              Text,
              {style: styles.topDescription, textBreakStrategy: 'simple'},
              [
                state.practiceMode
                  ? h(
                      Text,
                      {style: styles.bold},
                      t('secret_input.practice.header') + '\n',
                    )
                  : '',
                t('secret_input.header'),
              ],
            ),

            h(TextInput, {
              style: styles.inputField,
              sel: 'inputField',
              nativeID: 'FocusViewOnResume',
              value: state.inputWords,
              accessible: true,
              accessibilityLabel: t(
                'secret_input.fields.words_input.accessibility_label',
              ),
              autoFocus: true,
              multiline: true,
              autoCapitalize: 'none',
              autoCompleteType: 'password',
              keyboardType: Platform.select<KeyboardTypeOptions>({
                android: 'visible-password',
                ios: 'ascii-capable',
                default: 'default',
              }),
              secureTextEntry: true,
              returnKeyType: 'done',
              placeholder: t('secret_input.fields.words_input.placeholder'),
              placeholderTextColor: Palette.textWeak,
              selectionColor: Palette.backgroundTextSelection,
              underlineColorAndroid: Palette.backgroundTextWeak,
            }),

            h(Button, {
              sel: 'confirm',
              style: styles.ctaButton,
              text: t('secret_input.call_to_action.confirm.label'),
              strong: true,
              accessible: true,
              accessibilityLabel: t(
                'secret_input.call_to_action.confirm.accessibility_label',
              ),
            }),
          ]),
        ],
      ),
    ]),
  );
}
