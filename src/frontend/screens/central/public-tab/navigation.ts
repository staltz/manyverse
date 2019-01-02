/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../..';
import {navOptions as composeScreenNavOptions} from '../../compose';
import {navOptions as profileScreenNavOptions} from '../../profile';
import {navOptions as threadScreenNavOptions} from '../../thread';
import {navOptions as rawMsgScreenNavOptions} from '../../raw-msg';
import {State} from './model';

export type Actions = {
  goToCompose$: Stream<any>;
  goToProfile$: Stream<{authorFeedId: FeedId}>;
  goToThread$: Stream<{rootMsgId: MsgId; replyToMsgId?: MsgId}>;
  goToRawMsg$: Stream<Msg>;
};

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toCompose$ = actions.goToCompose$.map(
    () =>
      ({
        type: 'showOverlay',
        layout: {
          component: {
            name: Screens.Compose,
            options: composeScreenNavOptions,
          },
        },
      } as Command),
  );

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
              replyToMsgId: ev.replyToMsgId,
            },
            options: threadScreenNavOptions,
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

  return xs.merge(toCompose$, toProfile$, toThread$, toRawMsg$);
}
