/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {ReactElement} from 'react';
import {StyleSheet, View, Text, TextInput} from 'react-native';
import {SSBSource} from '../../drivers/ssb';
import FlagSecure from '../../components/FlagSecure';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {topBar, Sinks as TBSinks} from './top-bar';
import isolate from '@cycle/isolate';
import Button from '../../components/Button';
import {Toast} from '../../drivers/toast';
import {DialogSource} from '../../drivers/dialogs';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  dialog: DialogSource;
  ssb: SSBSource;
};

export type Sinks = {
  keyboard: Stream<'dismiss'>;
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  toast: Stream<Toast>;
  state: Stream<Reducer<State>>;
};

export type State = {
  backendWords: string | null;
  inputWords: string;
};

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
    // fontSize: Typography.fontSizeBig,
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

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
};

export type Actions = {
  goBack$: Stream<any>;
  updateWords$: Stream<string>;
  confirm$: Stream<any>;
};

function navigation(actions: Actions, confirmation$: Stream<boolean>) {
  return xs.merge(
    actions.goBack$.mapTo({type: 'pop'} as Command),

    confirmation$.filter(x => x === true).mapTo({type: 'popToRoot'} as Command),
  );
}

function intent(
  navSource: NavSource,
  screenSource: ReactSource,
  back$: Stream<any>,
) {
  return {
    goBack$: xs.merge(navSource.backPress(), back$),

    updateWords$: screenSource
      .select('inputField')
      .events('changeText') as Stream<string>,

    confirm$: screenSource.select('confirm').events('press'),
  };
}

function view(state$: Stream<State>, topBar$: Stream<ReactElement<any>>) {
  return xs.combine(topBar$, state$).map(([topBarVDOM, state]) =>
    h(View, {style: styles.screen}, [
      topBarVDOM,

      h(View, {style: styles.container}, [
        h(FlagSecure, [
          h(Text, {style: styles.topDescription, textBreakStrategy: 'simple'}, [
            h(
              Text,
              {style: styles.bold},
              'REPEAT IT TO CONFIRM IT IS CORRECT:\n',
            ),
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
            keyboardType: 'visible-password',
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

function model(actions: Actions, ssbSource: SSBSource) {
  const updateWordsReducer$ = actions.updateWords$.map(
    text =>
      function updateWordsReducer(prev: State): State {
        return {
          ...prev,
          inputWords: text
            .replace(/\d+/g, '') // no digits
            .replace('_', '') // no underscore
            .replace(/[^\w ]+/g, ''), // no misc symbols
        };
      },
  );

  const initReducer$ = xs.of(function initReducer(): State {
    return {backendWords: '', inputWords: ''};
  });

  const loadedBackendReducer$ = ssbSource.getMnemonic$().map(
    words =>
      function loadedReducer(prev: State): State {
        return {...prev, backendWords: words};
      },
  );

  return xs.merge(initReducer$, updateWordsReducer$, loadedBackendReducer$);
}

function dialog(
  actions: Actions,
  state$: Stream<State>,
  dialogSource: DialogSource,
) {
  return actions.confirm$
    .compose(sample(state$))
    .map(
      state =>
        state.backendWords ===
        state.inputWords
          .split(' ')
          .map(s => s.trim().toLowerCase())
          .join(' '),
    )
    .map(passed =>
      dialogSource
        .alert(
          passed ? 'Correct!' : 'Incorrect',
          passed
            ? "Your account's identity is now secure because you know the " +
                'recovery phrase.'
            : 'Try again: write down your recovery phrase consisting of 48 ' +
                'words separated by whitespace.',
        )
        .mapTo(passed),
    )
    .flatten();
}

export function secretInput(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);
  const actions = intent(sources.navigation, sources.screen, topBarSinks.back);
  const confirmation$ = dialog(actions, sources.state.stream, sources.dialog);
  const dismissKeyboard$ = actions.goBack$.mapTo('dismiss' as 'dismiss');
  const vdom$ = view(sources.state.stream, topBarSinks.screen);
  const command$ = navigation(actions, confirmation$);
  const reducer$ = model(actions, sources.ssb);

  return {
    keyboard: dismissKeyboard$,
    screen: vdom$,
    navigation: command$,
    toast: xs.never(),
    state: reducer$,
  };
}
