/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import isolate from '@cycle/isolate';
import {StateSource, Reducer} from '@cycle/state';
import {OrientationEvent} from '../../drivers/orientation';
import {Palette} from '../../global-styles/palette';
import tutorialPresentation from '../../components/tutorial-presentation';
import tutorialSlide from '../../components/tutorial-slide';
import Button from '../../components/Button';
import {navOptions as outputSecretScreenNavOptions} from '../secret-output';
import {Screens} from '../..';
import {topBar, Sinks as TBSinks} from './top-bar';

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

export const navOptions = {
  topBar: {
    visible: false,
    height: 0,
  },
};

export type Actions = {
  goBack$: Stream<any>;
};

export function backup(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);

  const goBack$ = xs
    .merge(sources.navigation.backPress(), topBarSinks.back)
    .mapTo({type: 'dismissOverlay'} as Command);

  const goToExportSecret$ = sources.screen
    .select('show-recovery-phrase')
    .events('press')
    .mapTo(
      xs.of(
        {
          type: 'dismissOverlay',
        } as Command,
        {
          type: 'push',
          id: 'mainstack',
          layout: {
            component: {
              name: Screens.SecretOutput,
              options: outputSecretScreenNavOptions,
            },
          },
        } as Command,
      ),
    )
    .flatten();

  const scrollBy$ = xs
    .merge(
      sources.screen.select('confirm-start').events('press'),
      sources.screen.select('confirm-data').events('press'),
    )
    .mapTo([/* offset */ +1, /* animated */ true] as [number, boolean]);

  const vdom$ = xs
    .combine(topBarSinks.screen, sources.state.stream)
    .map(([topBarVDOM, state]) =>
      h(View, {style: styles.screen}, [
        topBarVDOM,

        tutorialPresentation('swiper', {scrollBy$}, [
          tutorialSlide({
            show: state.index >= 0,
            portraitMode: state.isPortraitMode,
            image: require('../../../../images/noun-glassware.png'),
            title: 'Your account has\ntwo parts to keep safe',
            renderDescription: () => [],
            renderBottom: () =>
              h(Button, {
                sel: 'confirm-start',
                style: styles.button,
                textStyle: styles.buttonText,
                text: 'Continue',
                strong: false,
                accessible: true,
                accessibilityLabel: 'Continue Button',
              }),
          }),

          tutorialSlide({
            show: state.index >= 1,
            portraitMode: state.isPortraitMode,
            image: require('../../../../images/noun-books.png'),
            title: 'Data',
            renderDescription: () => [
              "This is your account's posts, messages, pictures, likes and " +
                'similar activity. To keep it safe against sudden loss, we ' +
                'use ',
              h(Text, {style: styles.bold}, 'crowd backup'),
              '. You only ' + 'need to ',
              h(
                Text,
                {style: styles.bold},
                'synchronize with reliable friends',
              ),
              ' or other devices you own. Just use Manyverse ' +
                'with friends often, there is ',
              h(Text, {style: styles.bold}, 'nothing else to do'),
              '! Your friends back you up.',
            ],
            renderBottom: () =>
              h(Button, {
                sel: 'confirm-data',
                style: styles.button,
                textStyle: styles.buttonText,
                text: 'I understand',
                strong: false,
                accessible: true,
                accessibilityLabel: 'I understand Button',
              }),
          }),

          tutorialSlide({
            show: state.index >= 2,
            portraitMode: state.isPortraitMode,
            image: require('../../../../images/noun-fingerprint.png'),
            title: 'Identity',
            renderDescription: () => [
              'Your account\'s "fingerprint" is made up of a highly unique ',
              h(Text, {style: styles.bold}, 'recovery phrase'),
              '. This is a sequence of 42 words that unlocks ' +
                'your account. ',
              h(Text, {style: styles.bold}, 'Keep it confidential'),
              ', because if anyone else has access to it, they can take control of ' +
                'your account. ',
              h(Text, {style: styles.bold}, 'Take responsibility'),
              ' over it, since you and only you can recover your account!',
            ],
            renderBottom: () =>
              h(Button, {
                sel: 'show-recovery-phrase',
                style: styles.ctaButton,
                text: 'Show Recovery Phrase',
                strong: true,
                accessible: true,
                accessibilityLabel: 'Show Recovery Phrase Button',
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
