/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactElement} from 'react';
import {StyleSheet} from 'react-native';
import {ReactSource} from '@cycle/react';
import isolate from '@cycle/isolate';
import {StateSource, Reducer} from '@cycle/state';
import {Command, NavSource} from 'cycle-native-navigation';
import {FeedId, MsgId} from 'ssb-typescript';
import {SSBSource, Req, PrivateThreadAndExtras} from '../../drivers/ssb';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {topBar, Sinks as TBSinks} from './top-bar';
import model, {State} from './model';
import view from './view';
import ssb from './ssb';
import navigation from './navigation';
import intent from './intent';

export type Props = {
  selfFeedId: FeedId;
  rootMsgId?: MsgId;
  recps?: PrivateThreadAndExtras['recps'];
};

export type Sources = {
  props: Stream<Props>;
  screen: ReactSource;
  ssb: SSBSource;
  navigation: NavSource;
  state: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
  state: Stream<Reducer<State>>;
  ssb: Stream<Req>;
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
    flexDirection: 'column',
  },

  bubbleText: {
    marginHorizontal: Dimensions.horizontalSpaceNormal,
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

export function conversation(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);
  const state$ = sources.state.stream;
  const vdom$ = view(state$, topBarSinks.screen);
  const actions = intent(sources.screen, sources.navigation, topBarSinks.back);
  const cmd$ = navigation(actions, state$);
  const reducer$ = model(sources.props, sources.ssb);
  const newContent$ = ssb(actions, state$);

  return {
    screen: vdom$,
    navigation: cmd$,
    ssb: newContent$,
    state: reducer$,
  };
}
