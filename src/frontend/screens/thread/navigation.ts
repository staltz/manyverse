/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId, Msg, MsgId} from 'ssb-typescript';
import {Command, PopCommand} from 'cycle-native-navigation';
import {State} from './model';
import {Screens} from '../..';
import {navOptions as accountsScreenNavOptions} from '../accounts';
import {navOptions as profileScreenNavOptions} from '../profile';
import {navOptions as rawMsgScreenNavOptions} from '../raw-msg';
import {navOptions as composeScreenNavOptions} from '../compose';
import {Likes} from '../../ssb/types';

export type Actions = {
  goToAccounts$: Stream<{msgKey: MsgId; likes: Likes}>;
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
              ...ev,
              selfFeedId: state.selfFeedId,
            },
            options: accountsScreenNavOptions,
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

  const toCompose$ = actions.goToCompose$.compose(sample(state$)).map(state => {
    const authors = (() => {
      const set = new Set<FeedId>();
      for (const msg of state.thread.messages) {
        const author = msg.value.author;
        if (author !== state.selfFeedId && !set.has(author)) {
          set.add(author);
        }
      }
      return [...set.values()];
    })();

    return {
      type: 'push',
      layout: {
        component: {
          name: Screens.Compose,
          options: composeScreenNavOptions,
          passProps: {text: state.replyText, root: state.rootMsgId, authors},
        },
      },
    } as Command;
  });

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

  const pop$ = actions.exitOfAnyKind$.mapTo({
    type: 'pop',
  } as PopCommand);

  return xs.merge(toAccounts$, toProfile$, toCompose$, toRawMsg$, pop$);
}
