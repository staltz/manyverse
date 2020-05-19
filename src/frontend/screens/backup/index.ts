/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {OrientationEvent} from '../../drivers/orientation';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import tutorialPresentation from '../../components/tutorial-presentation';
import tutorialSlide from '../../components/tutorial-slide';
import Button from '../../components/Button';
import TopBar from '../../components/TopBar';
import {navOptions as outputSecretScreenNavOptions} from '../secret-output';
import {Screens} from '../enums';

export type State = {
  index: number;
  isPortraitMode: boolean;
};

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  orientation: Stream<OrientationEvent>;
  state: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
    flexDirection: 'column',
  },

  bold: {
    fontWeight: 'bold',
  },

  button: {
    borderColor: Palette.colors.white,
    marginBottom: 62,
  },

  buttonText: {
    color: Palette.colors.white,
  },

  ctaButton: {
    backgroundColor: Palette.backgroundCTA,
    marginBottom: 62,
  },
});

function bold(innerText: string) {
  return h(Text, {style: styles.bold}, innerText);
}

export const navOptions = {
  layout: {
    backgroundColor: Palette.backgroundBrand,
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

export type Actions = {
  goBack$: Stream<any>;
};

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

  const vdom$ = sources.state.stream.map(state =>
    h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('backup.title')}),

      tutorialPresentation('swiper', {scrollBy$}, [
        tutorialSlide({
          show: state.index >= 0,
          portraitMode: state.isPortraitMode,
          image: require('../../../../images/noun-glassware.png'),
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
          image: require('../../../../images/noun-books.png'),
          title: 'Data',
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
          image: require('../../../../images/noun-fingerprint.png'),
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

  const updateOrientationReducer$ = sources.orientation.map(
    ori =>
      function updateOrientationReducer(prev: State): State {
        return {
          ...prev,
          isPortraitMode: ori === 'PORTRAIT' || ori === 'PORTRAIT-UPSIDEDOWN',
        };
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
    updateOrientationReducer$,
    updateIndexReducer$,
  );

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
  };
}
