// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {globalStyles} from '~frontend/global-styles/styles';
import Button from '~frontend/components/Button';
import FlagSecure from '~frontend/components/FlagSecure';
import TopBar from '~frontend/components/TopBar';
import {State} from './model';

export const styles = StyleSheet.create({
  screen: globalStyles.screen,

  container: {
    ...globalStyles.container,
    justifyContent: 'flex-start',
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    ...Platform.select({
      web: {
        alignSelf: 'center',
      },
    }),
  },

  topBar: {
    alignSelf: 'center',
    zIndex: 100,
  },

  topBarBackground: {
    zIndex: 10,
    position: 'absolute',
    height: Dimensions.toolbarHeight,
    backgroundColor: Palette.brandMain,
    top: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      web: {
        '-webkit-app-region': 'drag',
      },
    }),
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
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
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
      Platform.OS === 'web' ? h(View, {style: styles.topBarBackground}) : null,
      h(TopBar, {
        sel: 'topbar',
        style: styles.topBar,
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
