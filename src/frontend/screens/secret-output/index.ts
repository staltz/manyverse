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
import {StyleSheet, View, Text, Platform} from 'react-native';
import {SSBSource} from '../../drivers/ssb';
import {Dimensions} from '../../global-styles/dimens';
import FlagSecure from '../../components/FlagSecure';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {topBar, Sinks as TBSinks} from './top-bar';
import isolate from '@cycle/isolate';
import {navOptions as inputSecretScreenNavOptions} from '../secret-input';
import Button from '../../components/Button';
import {Screens} from '../..';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
};

export type State = {
  words: string;
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

  topDescription: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingTop: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    textAlign: 'center',
  },

  bottomDescription: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingTop: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    textAlign: 'left',
  },

  bold: {
    fontWeight: 'bold',
  },

  secretWords: {
    marginTop: Dimensions.verticalSpaceBig,
    alignSelf: 'stretch',
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyMonospace,
    fontWeight: Platform.select({ios: '500', default: 'normal'}),
    textAlign: 'left',
    textAlignVertical: 'top',
    color: Palette.textWeak,
    backgroundColor: Palette.backgroundTextWeak,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 2,
  },

  ctaButton: {
    backgroundColor: Palette.backgroundCTA,
    marginTop: Dimensions.verticalSpaceNormal,
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
  confirm$: Stream<any>;
};

function navigation(actions: Actions, state$: Stream<State>) {
  const goBack$ = actions.goBack$.mapTo({type: 'pop'} as Command);

  const goToPractice$ = actions.confirm$.compose(sample(state$)).map(
    state =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.SecretInput,
            options: inputSecretScreenNavOptions,
            passProps: {
              practiceMode: true,
              backendWords: state.words,
            },
          },
        },
      } as Command),
  );

  return xs.merge(goBack$, goToPractice$);
}

function intent(
  navSource: NavSource,
  screenSource: ReactSource,
  back$: Stream<any>,
) {
  return {
    goBack$: xs.merge(navSource.backPress(), back$),
    confirm$: screenSource.select('confirm-recovery-phrase').events('press'),
  };
}

function view(state$: Stream<State>, topBar$: Stream<ReactElement<any>>) {
  return xs.combine(topBar$, state$).map(([topBarVDOM, state]) =>
    h(View, {style: styles.screen}, [
      topBarVDOM,

      h(View, {style: styles.container}, [
        h(FlagSecure, [
          h(Text, {style: styles.topDescription, textBreakStrategy: 'simple'}, [
            'CAREFULLY WRITE DOWN THE FOLLOWING RECOVERY PHRASE ON A ',
            h(Text, {style: styles.bold}, 'PIECE OF PAPER'),
          ]),

          h(
            Text,
            {
              style: styles.secretWords,
              accessible: true,
              accessibilityLabel: 'Secret Words',
              selectable: true,
              selectionColor: Palette.backgroundTextSelection,
            },
            state.words ?? 'loading...',
          ),

          h(Text, {style: styles.topDescription, textBreakStrategy: 'simple'}, [
            'KEEP IT ',
            h(Text, {style: styles.bold}, 'CONFIDENTIAL'),
            ', AND\nTAKE SOLE ',
            h(Text, {style: styles.bold}, 'RESPONSIBILITY'),
            ' OVER IT',
          ]),

          h(Button, {
            sel: 'confirm-recovery-phrase',
            style: styles.ctaButton,
            text: 'Done',
            strong: true,
            accessible: true,
            accessibilityLabel: 'Confirm Recovery Phrase Button',
          }),
        ]),
      ]),
    ]),
  );
}

export function secretOutput(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);

  const actions = intent(sources.navigation, sources.screen, topBarSinks.back);

  const vdom$ = view(sources.state.stream, topBarSinks.screen);

  const command$ = navigation(actions, sources.state.stream);

  const initReducer$ = xs.of(function initReducer() {
    return {words: ''};
  });

  const loadedReducer$ = sources.ssb.getMnemonic$().map(
    words =>
      function loadedReducer(_prev: State): State {
        return {words};
      },
  );

  const reducer$ = xs.merge(initReducer$, loadedReducer$);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
  };
}
