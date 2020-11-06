/* Copyright (C) 2018-2020 The Manyverse Authors.
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
import {t} from '../../drivers/localization';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import FlagSecure from '../../components/FlagSecure';
import Button from '../../components/Button';
import TopBar from '../../components/TopBar';
import {navOptions as inputSecretScreenNavOptions} from '../secret-input';
import {Screens} from '../enums';

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

  bottomDescription: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingTop: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
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
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
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
  sideMenu: {
    left: {
      enabled: false,
    },
  },
};

export type Actions = {
  goBack$: Stream<any>;
  confirm$: Stream<any>;
};

function navigation(actions: Actions, state$: Stream<State>) {
  const goBack$ = actions.goBack$.mapTo({type: 'pop'} as Command);

  const goToPractice$ = actions.confirm$.compose(sample(state$)).map(
    (state) =>
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

function intent(navSource: NavSource, screenSource: ReactSource) {
  return {
    goBack$: xs.merge(
      navSource.backPress(),
      screenSource.select('topbar').events('pressBack'),
    ),
    confirm$: screenSource.select('confirm-recovery-phrase').events('press'),
  };
}

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

function view(state$: Stream<State>) {
  return state$.map((state) =>
    h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('secret_output.title')}),

      h(View, {style: styles.container}, [
        h(FlagSecure, [
          h(Text, {style: styles.topDescription, textBreakStrategy: 'simple'}, [
            t('secret_output.header.1_normal'),
            bold(t('secret_output.header.2_bold')),
            t('secret_output.header.3_normal'),
          ]),

          h(
            Text,
            {
              style: styles.secretWords,
              accessible: true,
              accessibilityRole: 'text',
              accessibilityLabel: t('secret_output.words.accessibility_label'),
              selectable: true,
              selectionColor: Palette.backgroundTextSelection,
            },
            state.words ?? t('secret_output.loading'),
          ),

          h(Text, {style: styles.topDescription, textBreakStrategy: 'simple'}, [
            t('secret_output.footer.1_normal'),
            bold(t('secret_output.footer.2_bold')),
            t('secret_output.footer.3_normal'),
            bold(t('secret_output.footer.4_bold')),
            t('secret_output.footer.5_normal'),
          ]),

          h(Button, {
            sel: 'confirm-recovery-phrase',
            style: styles.ctaButton,
            text: t('call_to_action.done'),
            strong: true,
            accessible: true,
            accessibilityLabel: t(
              'secret_output.call_to_action.confirm.accessibility_label',
            ),
          }),
        ]),
      ]),
    ]),
  );
}

export function secretOutput(sources: Sources): Sinks {
  const actions = intent(sources.navigation, sources.screen);

  const vdom$ = view(sources.state.stream);

  const command$ = navigation(actions, sources.state.stream);

  const initReducer$ = xs.of(function initReducer() {
    return {words: ''};
  });

  const loadedReducer$ = sources.ssb.getMnemonic$().map(
    (words) =>
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
