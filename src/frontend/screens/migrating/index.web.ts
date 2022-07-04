// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import {ReactElement, createElement as $} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import navigation from './navigation';

export interface Sources {
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
  migrating: Stream<number>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
}

export interface State {
  progress: number;
}

/** In milliseconds */
const TRANSITION_DURATION = 250;
/** In milliseconds */
const FLARE_ANIMATION_DURATION = 1400;

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.brandMain,
    flexDirection: 'column',
  },

  text: {
    marginBottom: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  progressContainer: {
    width: '60vw',
    backgroundColor: Palette.brandStrong,
    height: '5px',
    position: 'relative',
  },

  progressBasic: {
    position: 'absolute',
    zIndex: 1000,
    top: 0,
    height: '5px',
    backgroundColor: Palette.textForBackgroundBrand,
    transition: `width ${TRANSITION_DURATION}ms`,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  progressFlare: {
    marginRight: '0%',
    backgroundColor: Palette.brandWeakest,
    height: '100%',
    width: '8px',

    animationDuration: `${FLARE_ANIMATION_DURATION}ms`,
    animationDirection: 'normal',
    animationTimingFunction: 'ease-in-out',
    animationKeyframes: [
      {
        '0%': {marginRight: '100%'},
        '100%': {marginRight: '0%'},
      },
    ],
    animationIterationCount: 'infinite',
  },

  progressMask: {
    position: 'absolute',
    zIndex: 1100,
    top: 0,
    left: '-10px',
    bottom: 0,
    width: '10px',
    backgroundColor: Palette.brandMain,
  },
});

export function migrating(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const initialReducer$ = xs.of(function initialReducer(prev: State): State {
    return {progress: 0};
  });

  const updateProgressReducer$ = sources.migrating.map(
    (progress) =>
      function updateProgressReducer(prev: State): State {
        return {progress};
      },
  );

  const reducer$ = xs.merge(initialReducer$, updateProgressReducer$);

  const continue$ = sources.migrating
    .filter((x) => x >= 1)
    .take(1)
    .compose(delay(TRANSITION_DURATION * 1.5));

  const navCommand$ = navigation({continue$});

  const vdom$ = state$.map((state) => {
    const width = `${(state.progress * 100).toFixed(3)}%`;

    return $(View, {style: styles.screen}, [
      $(Text, {key: 't', style: styles.text}, t('migrating.label')),
      $(View, {key: 'p', style: styles.progressContainer}, [
        $(View, {style: [styles.progressBasic, {width}]}, [
          $(View, {
            key: 'p1',
            style: styles.progressFlare,
          }),
          $(View, {key: 'p2', style: styles.progressMask}),
        ]),
      ]),
    ]);
  });

  return {
    screen: vdom$,
    navigation: navCommand$,
    state: reducer$,
  };
}
