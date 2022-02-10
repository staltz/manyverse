// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {Reducer, StateSource} from '@cycle/state';
import {ReactElement} from 'react';
import {StyleSheet, View, Text, Platform} from 'react-native';
import {SSBSource} from '~frontend/drivers/ssb';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import FlagSecure from '~frontend/components/FlagSecure';
import Button from '~frontend/components/Button';
import TopBar from '~frontend/components/TopBar';
import {globalStyles} from '~frontend/global-styles/styles';
import {navOptions as inputSecretScreenNavOptions} from '~frontend/screens/secret-input';
import {Screens} from '~frontend/screens/enums';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  ssb: SSBSource;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
}

export interface State {
  words: string;
}

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
    borderRadius: Dimensions.borderRadiusSmall,
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

export interface Actions {
  goBack$: Stream<any>;
  confirm$: Stream<any>;
}

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
      Platform.OS === 'web' ? h(View, {style: styles.topBarBackground}) : null,
      h(TopBar, {
        sel: 'topbar',
        style: styles.topBar,
        title: t('secret_output.title'),
      }),

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
