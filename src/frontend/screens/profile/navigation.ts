/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Command, NavSource, PopCommand} from 'cycle-native-navigation';
import {navOptions as composeScreenNavOptions} from '../compose';
import {navOptions as editProfileScreenNavOptions} from '../profile-edit';
import {navOptions as bioScreenNavOptions} from '../biography';
import {navOptions as threadScreenNavOptions} from '../thread';
import {navOptions as accountsScreenNavOptions} from '../accounts';
import {navOptions as profileScreenNavOptions} from './index';
import {navOptions as rawMsgScreenNavOptions} from '../raw-msg';
import {MsgId, FeedId, Msg} from 'ssb-typescript';
import {Screens} from '../..';
import {State} from './model';
import {Likes} from '../../drivers/ssb';

export type Actions = {
  goToCompose$: Stream<null>;
  goToEdit$: Stream<null>;
  goToBio$: Stream<any>;
  goToAccounts$: Stream<{msgKey: MsgId; likes: Likes}>;
  goToProfile$: Stream<{authorFeedId: FeedId}>;
  goToThread$: Stream<{rootMsgId: MsgId; replyToMsgId?: MsgId}>;
  goToRawMsg$: Stream<Msg>;
};

export default function navigation(
  actions: Actions,
  navSource: NavSource,
  state$: Stream<State>,
  back$: Stream<any>,
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
            options: bioScreenNavOptions,
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
            options: editProfileScreenNavOptions,
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
              ...ev,
              selfFeedId: state.selfFeedId,
            },
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

  const pop$ = xs.merge(navSource.backPress(), back$).mapTo({
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
