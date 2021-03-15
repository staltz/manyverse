/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId, Msg, MsgId} from 'ssb-typescript';
import {Command, PopCommand} from 'cycle-native-navigation';
import {Screens} from '../enums';
import {Reactions, MsgAndExtras} from '../../ssb/types';
import {
  navOptions as accountsScreenNavOpts,
  Props as AccountProps,
} from '../accounts';
import {navOptions as profileScreenNavOpts} from '../profile/layout';
import {Props as ProfileProps} from '../profile/props';
import {navOptions as rawMsgScreenNavOpts} from '../raw-msg';
import {navOptions as threadScreenNavOpts} from './layout';
import {
  navOptions as composeScreenNavOpts,
  Props as ComposeProps,
} from '../compose';
import {State} from './model';
import {Props} from './props';

export type Actions = {
  goToAccounts$: Stream<{
    title: string;
    msgKey: MsgId;
    accounts: Array<FeedId> | Reactions;
  }>;
  goToAnotherThread$: Stream<{rootMsgId: MsgId; msg: MsgAndExtras}>;
  goToProfile$: Stream<{authorFeedId: FeedId}>;
  goToRawMsg$: Stream<Msg>;
  goToCompose$: Stream<any>;
  exitOfAnyKind$: Stream<any>;
};

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
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
            } as AccountProps,
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

  const toCompose$ = actions.goToCompose$
    .compose(sample(state$))
    .map((state) => {
      const messages = state.thread.messages;
      const lastMsgInThread = messages[messages.length - 1];
      const set = new Set<FeedId>();
      for (const msg of state.thread.messages) {
        const author = msg.value.author;
        if (author !== state.selfFeedId && !set.has(author)) {
          set.add(author);
        }
      }
      const authors = [...set.values()];

      return {
        type: 'push',
        layout: {
          component: {
            name: Screens.Compose,
            options: composeScreenNavOpts,
            passProps: {
              text: state.replyText,
              root: state.rootMsgId,
              fork: state.higherRootMsgId,
              branch: lastMsgInThread.key,
              authors,
              selfAvatarUrl: state.selfAvatarUrl,
            } as ComposeProps,
          },
        },
      } as Command;
    });

  const toThread$ = actions.goToAnotherThread$
    .compose(sampleCombine(state$))
    .map(
      ([ev, state]) =>
        ({
          type: 'push',
          layout: {
            component: {
              name: Screens.Thread,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                rootMsg: ev.msg,
                higherRootMsgId: ev.rootMsgId,
                lastSessionTimestamp: state.lastSessionTimestamp,
              } as Props,
              options: threadScreenNavOpts,
            },
          },
        } as Command),
    );

  const toRawMsg$ = actions.goToRawMsg$.map(
    (msg) =>
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

  const pop$ = actions.exitOfAnyKind$.mapTo({
    type: 'pop',
  } as PopCommand);

  return xs.merge(
    toAccounts$,
    toProfile$,
    toCompose$,
    toThread$,
    toRawMsg$,
    pop$,
  );
}
