/* Copyright (C) 2018-2020 The Manyverse Authors.
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
import {MsgId, About, FeedId} from 'ssb-typescript';
import {Screens} from '../enums';
import {SSBSource} from '../../drivers/ssb';
import {navOptions as profileScreenNavOptions} from '../profile';
import {Props as ProfileProps} from '../profile/props';
import AccountsList, {Props as ListProps} from '../../components/AccountsList';
import TopBar from '../../components/TopBar';
import {Palette} from '../../global-styles/palette';
export {navOptions} from './layout';

export type Props = {
  title: string;
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  msgKey: MsgId;
  accounts: Array<FeedId | [string, string]> | null;
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
  title: string;
  abouts: Array<About>;
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
};

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: Palette.voidMain,
    flexDirection: 'column',
  },

  container: {
    alignSelf: 'stretch',
    flex: 1,
  },
});

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
              selfAvatarUrl: state.selfAvatarUrl,
              feedId: ev.id,
            } as ProfileProps,
            options: profileScreenNavOptions,
          },
        },
      } as Command),
  );

  return xs.merge(pop$, toProfile$);
}

function intent(navSource: NavSource, reactSource: ReactSource) {
  return {
    goBack$: xs.merge(
      navSource.backPress(),
      reactSource.select('topbar').events('pressBack'),
    ),

    goToProfile$: reactSource.select('accounts').events('pressAccount'),
  };
}

export function accounts(sources: Sources): Sinks {
  const actions = intent(sources.navigation, sources.screen);

  const vdom$ = sources.state.stream.map((state) => {
    const abouts = state.abouts;

    return h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: state.title}),
      h(
        ScrollView,
        {
          style: styles.container,
          refreshControl: h(RefreshControl, {
            refreshing: state.abouts.length === 0,
            colors: [Palette.brandMain],
          }),
        },
        [h(AccountsList, {sel: 'accounts', accounts: abouts} as ListProps)],
      ),
    ]);
  });

  const command$ = navigation(actions, sources.state.stream);

  const propsReducer$ = sources.props.map(
    ({selfFeedId, selfAvatarUrl, title}) =>
      function propsReducer(prev?: State): State {
        if (prev) {
          return {...prev, selfFeedId, selfAvatarUrl, title};
        } else {
          return {abouts: [], selfFeedId, selfAvatarUrl, title};
        }
      },
  );

  const aboutsReducer$ = sources.props
    .filter((props) => !!props.accounts)
    .map((props) => {
      const hasReactions =
        props.accounts &&
        props.accounts.length >= 1 &&
        Array.isArray(props.accounts[0]);

      const reactions = new Map(
        hasReactions ? (props.accounts as Array<[FeedId, string]>) : undefined,
      );

      const ids = hasReactions
        ? (props.accounts! as Array<[FeedId, string]>).map((x) => x[0])
        : (props.accounts! as Array<FeedId>);

      return sources.ssb.liteAbout$(ids).map(
        (rawAbouts) =>
          function propsReducer(prev: State): State {
            const abouts = hasReactions
              ? rawAbouts.map((about) => ({
                  ...about,
                  reaction: reactions.get(about.id),
                }))
              : rawAbouts;
            return {...prev, abouts};
          },
      );
    })
    .flatten();

  const reducer$ = xs.merge(propsReducer$, aboutsReducer$);

  return {
    screen: vdom$,
    navigation: command$,
    state: reducer$,
  };
}
