/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {MsgId, FeedId, Msg} from 'ssb-typescript';
import {Command, NavSource, PopCommand} from 'cycle-native-navigation';
import {Reactions} from '../../ssb/types';
import {Screens} from '../enums';
import {navOptions as composeScreenNavOpts} from '../compose';
import {navOptions as editProfileScreenNavOpts} from '../profile-edit';
import {navOptions as bioScreenNavOpts} from '../biography';
import {navOptions as threadScreenNavOpts} from '../thread/layout';
import {navOptions as accountsScreenNavOptions} from '../accounts/layout';
import {navOptions as profileScreenNavOpts} from './layout';
import {navOptions as rawMsgScreenNavOpts} from '../raw-msg';
import {Props as AccountProps} from '../accounts';
import {State} from './model';

export type Actions = {
  goBack$: Stream<any>;
  goToCompose$: Stream<null>;
  goToEdit$: Stream<null>;
  goToBio$: Stream<any>;
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
  navSource: NavSource,
  state$: Stream<State>,
): Stream<Command> {
  const toCompose$ = actions.goToCompose$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Compose,
            options: composeScreenNavOpts,
          },
        },
      } as Command),
  );

  const toBio$ = actions.goToBio$.compose(sample(state$)).map(
    state =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Biography,
            passProps: {
              about: state.about,
            },
            options: bioScreenNavOpts,
          },
        },
      } as Command),
  );

  const toEdit$ = actions.goToEdit$.compose(sample(state$)).map(
    state =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.ProfileEdit,
            passProps: {
              about: state.about,
            },
            options: editProfileScreenNavOpts,
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
            } as AccountProps,
            options: accountsScreenNavOptions,
          },
        },
      } as Command),
  );

  const toOtherProfile$ = actions.goToProfile$
    .compose(sampleCombine(state$))
    .filter(([ev, state]) => ev.authorFeedId !== state.displayFeedId)
    .map(
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

  const pop$ = xs.merge(navSource.backPress(), actions.goBack$).mapTo({
    type: 'pop',
  } as PopCommand);

  return xs.merge(
    toCompose$,
    toBio$,
    toEdit$,
    toAccounts$,
    toOtherProfile$,
    toThread$,
    toRawMsg$,
    pop$,
  );
}
