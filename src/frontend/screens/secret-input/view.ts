/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Platform,
  KeyboardTypeOptions,
} from 'react-native';
import {h} from '@cycle/react';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import Button from '../../components/Button';
import FlagSecure from '../../components/FlagSecure';
import {State} from './model';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
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
    borderRadius: 2,
    textAlign: 'left',
    textAlignVertical: 'top',
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyMonospace,
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
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    textAlign: 'center',
  },

  ctaButton: {
    backgroundColor: Palette.backgroundCTA,
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceBig,
    alignSelf: 'center',
  },
});

export default function view(
  state$: Stream<State>,
  topBar$: Stream<ReactElement<any>>,
) {
  return xs.combine(topBar$, state$).map(([topBarVDOM, state]) =>
    h(View, {style: styles.screen}, [
      topBarVDOM,

      h(View, {style: styles.container}, [
        h(FlagSecure, [
          h(Text, {style: styles.topDescription, textBreakStrategy: 'simple'}, [
            state.practiceMode
              ? h(
                  Text,
                  {style: styles.bold},
                  'REPEAT IT TO CONFIRM IT IS CORRECT:\n',
                )
              : '',
            'CAREFULLY INPUT YOUR RECOVERY PHRASE',
          ]),

          h(TextInput, {
            style: styles.inputField,
            sel: 'inputField',
            nativeID: 'FocusViewOnResume',
            value: state.inputWords,
            accessible: true,
            accessibilityLabel: 'Recovery Phrase Text Input',
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
            placeholder: '48-word recovery phrase',
            placeholderTextColor: Palette.textVeryWeak,
            selectionColor: Palette.backgroundTextSelection,
            underlineColorAndroid: Palette.backgroundTextWeak,
          }),

          h(Button, {
            sel: 'confirm',
            style: styles.ctaButton,
            text: 'Confirm',
            strong: true,
            accessible: true,
            accessibilityLabel: 'Confirm Recovery Phrase Button',
          }),
        ]),
      ]),
    ]),
  );
}
