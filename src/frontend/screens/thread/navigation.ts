/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId, Msg} from 'ssb-typescript';
import {Command, NavSource, PopCommand} from 'cycle-native-navigation';
import {State} from './model';
import {Screens} from '../..';
import {navOptions as profileScreenNavOptions} from '../profile';
import {navOptions as rawMsgScreenNavOptions} from '../raw-msg';

export type Actions = {
  goToProfile$: Stream<{authorFeedId: FeedId}>;
  goToRawMsg$: Stream<Msg>;
};

export default function navigation(
  actions: Actions,
  navSource: NavSource,
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
            options: profileScreenNavOptions,
          },
        },
      } as Command),
  );

  const toRawMsg$ = actions.goToRawMsg$.map(
    msg =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.RawMessage,
            passProps: {msg},
            options: rawMsgScreenNavOptions,
          },
        },
      } as Command),
  );

  const pop$ = navSource.backPress().mapTo(
    {
      type: 'pop',
    } as PopCommand,
  );

  return xs.merge(toProfile$, toRawMsg$, pop$);
}
