// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import {ReactSource} from '@cycle/react';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {SSBSource, Req} from '~frontend/drivers/ssb';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import model, {State} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';
import intent from './intent';
import {Props as P} from './props';
export {navOptions} from './layout';

export type Props = P;

export interface Sources {
  props: Stream<Props>;
  screen: ReactSource;
  ssb: SSBSource;
  navigation: NavSource;
  state: StateSource<State>;
}

export interface Sinks {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  bubbleText: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
  },
});

export function conversation(sources: Sources): Sinks {
  const state$ = sources.state.stream;
  const vdom$ = view(state$);
  const actions = intent(sources.screen, sources.navigation);
  const cmd$ = navigation(actions, sources.props, state$);
  const reducer$ = model(sources.props, sources.ssb, actions);
  const newContent$ = ssb(actions, state$);

  return {
    screen: vdom$,
    navigation: cmd$,
    ssb: newContent$,
    state: reducer$,
  };
}
