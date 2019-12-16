/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {ReactElement} from 'react';
import {ReactSource, h} from '@cycle/react';
import {StyleSheet, View, ScrollView, RefreshControl} from 'react-native';
import {Command, PopCommand, NavSource} from 'cycle-native-navigation';
import {Reducer, StateSource} from '@cycle/state';
import isolate from '@cycle/isolate';
import {MsgId, About, FeedId} from 'ssb-typescript';
import {Screens} from '../..';
import {SSBSource} from '../../drivers/ssb';
import {Likes} from '../../ssb/types';
import {navOptions as profileScreenNavOptions} from '../profile';
import AccountsList, {Props as ListProps} from '../../components/AccountsList';
import {Palette} from '../../global-styles/palette';
import {topBar, Sinks as TBSinks} from './top-bar';

export type Props = {
  selfFeedId: FeedId;
  msgKey: MsgId;
  likes: Likes;
};

export type Sources = {
  props: Stream<Props>;
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
  likers: Array<About>;
  selfFeedId: FeedId;
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundVoid,
    flexDirection: 'column',
  },

  container: {
    alignSelf: 'stretch',
    flex: 1,
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
  goToProfile$: Stream<{id: FeedId}>;
};

function navigation(actions: Actions, state$: Stream<State>) {
  const pop$ = actions.goBack$.mapTo({
    type: 'pop',
  } as PopCommand);

  const toProfile$ = actions.goToProfile$.compose(sampleCombine(state$)).map(
    ([ev, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              feedId: ev.id,
            },
            options: profileScreenNavOptions,
          },
        },
      } as Command),
  );

  return xs.merge(pop$, toProfile$);
}

function intent(
  navSource: NavSource,
  reactSource: ReactSource,
  back$: Stream<any>,
) {
  return {
    goBack$: xs.merge(navSource.backPress(), back$),

    goToProfile$: reactSource.select('accounts').events('pressAccount'),
  };
}

export function accounts(sources: Sources): Sinks {
  const topBarSinks: TBSinks = isolate(topBar, 'topBar')(sources);

  const actions = intent(sources.navigation, sources.screen, topBarSinks.back);

  const vdom$ = xs
    .combine(topBarSinks.screen, sources.state.stream)
    .map(([topBarVDOM, state]) => {
      const likers = state.likers;

      return h(View, {style: styles.screen}, [
        topBarVDOM,
        h(
          ScrollView,
          {
            style: styles.container,
            refreshControl: h(RefreshControl, {
              refreshing: state.likers.length === 0,
              colors: [Palette.backgroundBrand],
            }),
          },
          [h(AccountsList, {sel: 'accounts', accounts: likers} as ListProps)],
        ),
      ]);
    });

  const command$ = navigation(actions, sources.state.stream);

  const propsReducer$ = sources.props.map(
    props =>
      function propsReducer(prev?: State): State {
        if (prev) {
          return {...prev, selfFeedId: props.selfFeedId};
        } else {
          return {likers: [], selfFeedId: props.selfFeedId};
        }
      },
  );

  const aboutsReducer$ = sources.props
    .filter(props => !!props.likes)
    .map(props => sources.ssb.liteAbout$(props.likes!))
    .flatten()
    .map(abouts => {
      return function propsReducer(prev: State): State {
        return {...prev, likers: abouts};
      };
    });

  const reducer$ = xs.merge(propsReducer$, aboutsReducer$);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
  };
}
