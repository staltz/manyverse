// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {OrientationEvent} from '~frontend/drivers/orientation';
import {t} from '~frontend/drivers/localization';
import {WindowSize} from '~frontend/drivers/window-size';
import {Palette} from '~frontend/global-styles/palette';
import {getImg} from '~frontend/global-styles/utils';
import {globalStyles} from '~frontend/global-styles/styles';
import tutorialPresentation from '~frontend/components/tutorial-presentation';
import tutorialSlide from '~frontend/components/tutorial-slide';
import Button from '~frontend/components/Button';
import TopBar from '~frontend/components/TopBar';
import {navOptions as outputSecretScreenNavOptions} from '~frontend/screens/secret-output';
import {Screens} from '~frontend/screens/enums';

export interface State {
  index: number;
  isPortraitMode: boolean;
}

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  orientation: Stream<OrientationEvent>;
  windowSize: Stream<WindowSize>;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
}

export const styles = StyleSheet.create({
  screen: {
    ...globalStyles.screen,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.brandMain,
  },

  topBar: {
    alignSelf: 'center',
  },

  bold: {
    fontWeight: 'bold',
  },

  button: {
    borderColor: Palette.colors.white,
    ...Platform.select({
      web: {},
      default: {
        marginBottom: 62,
      },
    }),
  },

  buttonText: {
    color: Palette.colors.white,
  },

  ctaButton: {
    backgroundColor: Palette.backgroundCTA,
    ...Platform.select({
      web: {},
      default: {
        marginBottom: 62,
      },
    }),
  },
});

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

export const navOptions = {
  layout: {
    backgroundColor: Palette.brandMain,
  },
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: false,
    },
  },
  animations: {
    push: {
      enabled: false,
    },
    pop: {
      enabled: false,
    },
  },
};

export interface Actions {
  goBack$: Stream<any>;
}

export function backup(sources: Sources): Sinks {
  const goBack$ = xs
    .merge(
      sources.navigation.backPress(),
      sources.screen.select('topbar').events('pressBack'),
    )
    .mapTo({type: 'pop'} as Command);

  const goToExportSecret$ = sources.screen
    .select('show-recovery-phrase')
    .events('press')
    .mapTo({
      type: 'push',
      layout: {
        component: {
          name: Screens.SecretOutput,
          options: outputSecretScreenNavOptions,
        },
      },
    } as Command);

  const scrollBy$ = xs
    .merge(
      sources.screen.select('confirm-start').events('press'),
      sources.screen.select('confirm-data').events('press'),
    )
    .mapTo([/* offset */ +1, /* animated */ true] as [number, boolean]);

  /**
   * Necessary to fix quirks with nuka-carousel on desktop.
   */
  const forceRerender$ = sources.navigation
    .globalDidDisappear(Screens.SecretOutput)
    .startWith(null as any) as Stream<unknown>;

  const vdom$ = xs
    .combine(sources.state.stream, forceRerender$)
    .map(([state]) =>
      h(View, {style: styles.screen}, [
        h(TopBar, {
          sel: 'topbar',
          style: styles.topBar,
          title: t('backup.title'),
        }),

        tutorialPresentation('swiper', {scrollBy$}, [
          tutorialSlide({
            show: state.index >= 0,
            portraitMode: state.isPortraitMode,
            image: getImg(require('~images/noun-glassware.png')),
            title: t('backup.introduction.title'),
            renderDescription: () => [],
            renderBottom: () =>
              h(Button, {
                sel: 'confirm-start',
                style: styles.button,
                textStyle: styles.buttonText,
                text: t('call_to_action.continue'),
                strong: false,
                accessible: true,
                accessibilityLabel: t('call_to_action.continue'),
              }),
          }),

          tutorialSlide({
            show: state.index >= 1,
            portraitMode: state.isPortraitMode,
            image: getImg(require('~images/noun-books.png')),
            title: t('backup.data.title'),
            renderDescription: () => [
              t('backup.data.description.1_normal'),
              bold(t('backup.data.description.2_bold')),
              t('backup.data.description.3_normal'),
              bold(t('backup.data.description.4_bold')),
              t('backup.data.description.5_normal'),
              bold(t('backup.data.description.6_bold')),
              t('backup.data.description.7_normal'),
            ],
            renderBottom: () =>
              h(Button, {
                sel: 'confirm-data',
                style: styles.button,
                textStyle: styles.buttonText,
                text: t('backup.data.call_to_action.acknowledge.label'),
                strong: false,
                accessible: true,
                accessibilityLabel: t(
                  'backup.data.call_to_action.acknowledge.accessibility_label',
                ),
              }),
          }),

          tutorialSlide({
            show: state.index >= 2,
            portraitMode: state.isPortraitMode,
            image: getImg(require('~images/noun-fingerprint.png')),
            title: t('backup.identity.title'),
            renderDescription: () => [
              t('backup.identity.description.1_normal'),
              bold(t('backup.identity.description.2_bold')),
              t('backup.identity.description.3_normal'),
              bold(t('backup.identity.description.4_bold')),
              t('backup.identity.description.5_normal'),
              bold(t('backup.identity.description.6_bold')),
              t('backup.identity.description.7_normal'),
            ],
            renderBottom: () =>
              h(Button, {
                sel: 'show-recovery-phrase',
                style: styles.ctaButton,
                text: t('backup.identity.call_to_action.show_recovery_phrase'),
                strong: true,
                accessible: true,
                accessibilityLabel: t(
                  'backup.identity.call_to_action.show_recovery_phrase',
                ),
              }),
          }),
        ]),
      ]),
    );

  const command$ = xs.merge(goBack$, goToExportSecret$);

  const initReducer$ = xs.of(function initReducer(_prev?: State): State {
    return {index: 0, isPortraitMode: true};
  });

  const updatePortraitModeReducer$ = xs
    .combine(sources.orientation, sources.windowSize)
    .map(
      ([ori, win]) =>
        function updatePortraitModeReducer(prev: State): State {
          const isPortraitMode =
            Platform.OS === 'web'
              ? win.height >= 540
              : ori === 'PORTRAIT' || ori === 'PORTRAIT-UPSIDEDOWN';
          return {...prev, isPortraitMode: isPortraitMode};
        },
    );

  const updateIndexReducer$ = sources.screen
    .select('swiper')
    .events('indexChanged')
    .map(
      (newIndex: number) =>
        function updateIndexReducer(prev: State): State {
          // only go forward
          return {...prev, index: Math.max(prev.index, newIndex)};
        },
    );

  const reducer$ = xs.merge(
    initReducer$,
    updatePortraitModeReducer$,
    updateIndexReducer$,
  );

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
  };
}
