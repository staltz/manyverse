// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import {ReactElement} from 'react';
import {
  ImageSourcePropType,
  ImageStyle,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {Command, NavSource} from 'cycle-native-navigation';
import {ReactSource, h} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {globalStyles} from '../../global-styles/styles';
import tutorialPresentation from '../../components/tutorial-presentation';
import tutorialSlide from '../../components/tutorial-slide';
import Button from '../../components/Button';
import TopBar from '../../components/TopBar';
import {Props} from './props';

export interface Sources {
  props: Stream<Props>;
  screen: ReactSource;
  navigation: NavSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
}

export interface State {
  index: number;
  title: string;
  content1: string;
  content2?: string;
  image2?: ImageSourcePropType;
  image2Style?: ImageStyle;
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
});

export function instructions(sources: Sources): Sinks {
  const state$ = sources.state.stream;

  const goBack$ = xs
    .merge(
      sources.navigation.backPress(),
      sources.screen.select('topbar').events('pressBack'),
      sources.screen.select('done').events('press'),
    )
    .mapTo({type: 'pop'} as Command);

  const scrollBy$ = sources.screen
    .select('next-page')
    .events('press')
    .mapTo([/* offset */ +1, /* animated */ true] as [number, boolean]);

  const vdom$ = state$.map((state) =>
    h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', style: styles.topBar}),

      tutorialPresentation('swiper', {scrollBy$, showDots: !!state.content2}, [
        tutorialSlide({
          show: state.index >= 0,
          portraitMode: false,
          title: state.title,
          renderDescription: () => [state.content1],
          renderBottom: () =>
            state.content2
              ? h(Button, {
                  sel: 'next-page',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: t('call_to_action.continue'),
                  strong: false,
                  accessible: true,
                  accessibilityLabel: t('call_to_action.continue'),
                })
              : h(Button, {
                  sel: 'done',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: t('call_to_action.ok'),
                  strong: false,
                  accessible: true,
                  accessibilityLabel: t('call_to_action.ok'),
                }),
        }),

        state.content2
          ? tutorialSlide({
              show: state.index >= 1,
              portraitMode: !!state.image2,
              title: '',
              renderDescription: () => [state.content2!],
              image: state.image2,
              imageStyle: state.image2Style,
              renderBottom: () =>
                h(Button, {
                  sel: 'done',
                  style: styles.button,
                  textStyle: styles.buttonText,
                  text: t('call_to_action.ok'),
                  strong: false,
                  accessible: true,
                  accessibilityLabel: t('call_to_action.ok'),
                }),
            })
          : null,
      ]),
    ]),
  );

  const propsReducer$ = sources.props.take(1).map(
    (props) =>
      function propsReducer(): State {
        return {
          index: 0,
          title: props.title,
          content1: props.content1,
          content2: props.content2,
          image2: props.image2,
          image2Style: props.image2Style,
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

  const reducer$ = concat(propsReducer$, updateIndexReducer$);

  return {
    screen: vdom$,
    navigation: goBack$,
    state: reducer$,
  };
}
