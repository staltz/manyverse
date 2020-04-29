/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Command} from 'cycle-native-navigation';
import {Reducer, StateSource} from '@cycle/state';
import {FeedId, MsgId} from 'ssb-typescript';
import {
  GlobalEvent,
  TriggerFeedCypherlink,
  TriggerMsgCypherlink,
} from '../../drivers/eventbus';
import {SSBSource} from '../../drivers/ssb';
import {Screens} from '../..';
import {navOptions as profileScreenNavOpts} from '../profile';
import {navOptions as threadScreenNavOpts} from '../thread';

export type State = {
  selfFeedId: FeedId;
};

export type Sources = {
  state: StateSource<State>;
  ssb: SSBSource;
  globalEventBus: Stream<GlobalEvent>;
};

export type Sinks = {
  state: Stream<Reducer<State>>;
  navigation: Stream<Command>;
};

function intent(globalEventBus: Stream<GlobalEvent>) {
  return {
    goToProfile$: globalEventBus
      .filter(ev => ev.type === 'triggerFeedCypherlink')
      .map(ev => ({authorFeedId: (ev as TriggerFeedCypherlink).feedId})),

    goToThread$: globalEventBus
      .filter(ev => ev.type === 'triggerMsgCypherlink')
      .map(ev => ({rootMsgId: (ev as TriggerMsgCypherlink).msgId})),
  };
}

export type Actions = {
  goToProfile$: Stream<{authorFeedId: FeedId}>;
  goToThread$: Stream<{rootMsgId: MsgId}>;
};

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toProfile$ = actions.goToProfile$.compose(sampleCombine(state$)).map(
    ([ev, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              feedId: ev.authorFeedId,
            },
            options: profileScreenNavOpts,
          },
        },
      } as Command),
  );

  const toThread$ = actions.goToThread$.compose(sampleCombine(state$)).map(
    ([ev, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Thread,
            passProps: {
              selfFeedId: state.selfFeedId,
              rootMsgId: ev.rootMsgId,
            },
            options: threadScreenNavOpts,
          },
        },
      } as Command),
  );

  return xs.merge(toProfile$, toThread$);
}

function model(ssbSource: SSBSource) {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) {
      return prev;
    } else {
      return {selfFeedId: ''};
    }
  });

  const setSelfFeedId$ = ssbSource.selfFeedId$.map(
    selfFeedId =>
      function setSelfFeedId(prev: State): State {
        return {...prev, selfFeedId};
      },
  );

  return xs.merge(initReducer$, setSelfFeedId$);
}

export function global(sources: Sources): Sinks {
  const actions = intent(sources.globalEventBus);
  const cmd$ = navigation(actions, sources.state.stream);
  const reducer$ = model(sources.ssb);

  return {
    navigation: cmd$,
    state: reducer$,
  };
}
