/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../..';
import {Reactions} from '../../../ssb/types';
import {navOptions as composeScreenNavOptions} from '../../compose';
import {
  navOptions as accountsScreenNavOpts,
  Props as AccountsProps,
} from '../../accounts';
import {navOptions as profileScreenNavOpts} from '../../profile';
import {navOptions as threadScreenNavOpts} from '../../thread';
import {navOptions as rawMsgScreenNavOpts} from '../../raw-msg';
import {State} from './model';

export type Actions = {
  goToCompose$: Stream<any>;
  goToAccounts$: Stream<{
    title: string;
    msgKey: MsgId;
    accounts: Array<FeedId> | Reactions;
  }>;
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
        type: 'push',
        layout: {
          component: {
            name: Screens.Compose,
            options: composeScreenNavOptions,
          },
        },
      } as Command),
  );

  const toAccounts$ = actions.goToAccounts$.compose(sampleCombine(state$)).map(
    ([ev, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Accounts,
            passProps: {
              title: ev.title,
              msgKey: ev.msgKey,
              accounts: ev.accounts,
              selfFeedId: state.selfFeedId,
            } as AccountsProps,
            options: accountsScreenNavOpts,
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
              replyToMsgId: ev.replyToMsgId,
            },
            options: threadScreenNavOpts,
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
            options: rawMsgScreenNavOpts,
          },
        },
      } as Command),
  );

  return xs.merge(toCompose$, toAccounts$, toProfile$, toThread$, toRawMsg$);
}
