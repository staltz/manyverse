/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import sample from 'xstream-sample';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {Screens} from '../../enums';
import {Reactions, MsgAndExtras} from '../../../ssb/types';
import {navOptions as composeScreenNavOptions} from '../../compose';
import {Props as ComposeProps} from '../../compose/props';
import {Props as AccountsProps} from '../../accounts';
import {navOptions as accountsScreenNavOpts} from '../../accounts/layout';
import {navOptions as profileScreenNavOpts} from '../../profile';
import {Props as ProfileProps} from '../../profile/props';
import {
  navOptions as threadScreenNavOpts,
  Props as ThreadProps,
} from '../../thread';
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
  goToThread$: Stream<MsgAndExtras>;
  goToThreadExpandCW$: Stream<MsgAndExtras>;
  goToRawMsg$: Stream<Msg>;
};

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toCompose$ = actions.goToCompose$.compose(sample(state$)).map(
    state =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Compose,
            passProps: {
              selfAvatarUrl: state.selfAvatarUrl,
            } as ComposeProps,
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
              selfAvatarUrl: state.selfAvatarUrl,
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
              selfAvatarUrl: state.selfAvatarUrl,
              feedId: ev.authorFeedId,
            } as ProfileProps,
            options: profileScreenNavOpts,
          },
        },
      } as Command),
  );

  const toThread$ = actions.goToThread$.compose(sampleCombine(state$)).map(
    ([msg, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Thread,
            passProps: {
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              rootMsg: msg,
            } as ThreadProps,
            options: threadScreenNavOpts,
          },
        },
      } as Command),
  );

  const toThreadExpandCW$ = actions.goToThreadExpandCW$
    .compose(sampleCombine(state$))
    .map(
      ([msg, state]) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.Thread,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                rootMsg: msg,
                expandRootCW: true,
              } as ThreadProps,
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

  return xs.merge(
    toCompose$,
    toAccounts$,
    toProfile$,
    toThread$,
    toThreadExpandCW$,
    toRawMsg$,
  );
}
