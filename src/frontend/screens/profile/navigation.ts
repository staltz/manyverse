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
import {SSBSource, GetReadable} from '../../drivers/ssb';
import {Reactions, MsgAndExtras, PrivateThreadAndExtras} from '../../ssb/types';
import {Screens} from '../enums';
import {navOptions as composeScreenNavOpts} from '../compose';
import {Props as ComposeProps} from '../compose/props';
import {navOptions as editProfileScreenNavOpts} from '../profile-edit';
import {navOptions as bioScreenNavOpts} from '../biography';
import {navOptions as threadScreenNavOpts} from '../thread/layout';
import {Props as ThreadProps} from '../thread/props';
import {navOptions as accountsScreenNavOptions} from '../accounts/layout';
import {navOptions as rawMsgScreenNavOpts} from '../raw-msg';
import {navOptions as profileScreenNavOpts} from './layout';
import {Props} from './props';
import {Props as AccountProps} from '../accounts';
import {Props as ConversationProps} from '../conversation';
import {State} from './model';
import {navOptions as conversationNavOpts} from '../conversation';

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
  goToThread$: Stream<MsgAndExtras>;
  goToThreadExpandCW$: Stream<MsgAndExtras>;
  goToRawMsg$: Stream<Msg>;
  goToPrivateChat$: Stream<string>;
};

function getPrivateMessageWithRecipient(
  getReadable: GetReadable<PrivateThreadAndExtras>,
  recpId: string,
): Promise<string | undefined> {
  return new Promise(function(resolve) {
    const privateFeedReadable = getReadable();

    privateFeedReadable(null, function read(
      end: any,
      item: PrivateThreadAndExtras,
    ) {
      if (end) {
        return resolve(undefined);
      }

      // Conversation just between user and the open profile
      if (
        item.recps.length === 2 &&
        item.recps.some(recp => recp.id === recpId)
      ) {
        return resolve(item.messages[0].key);
      }

      return privateFeedReadable(null, read);
    });
  });
}

function getConversationPassProps(
  feedId: string,
  avatarUrl: string | undefined,
  profileId: string,
  rootMsgId: string | undefined,
): ConversationProps {
  return {
    goBackActionType: 'pop',
    selfFeedId: feedId,
    selfAvatarUrl: avatarUrl,
    rootMsgId,
    ...(rootMsgId
      ? {}
      : {
          recps: [
            {
              id: profileId,
            },
          ],
        }),
  } as ConversationProps;
}

export default function navigation(
  actions: Actions,
  ssbSource: SSBSource,
  navSource: NavSource,
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
              selfAvatarUrl: state.selfAvatarUrl,
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
                selfAvatarUrl: state.selfAvatarUrl,
                feedId: ev.authorFeedId,
              } as Props,
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

  const goToPrivateChat$ = actions.goToPrivateChat$
    .compose(sampleCombine(state$, ssbSource.privateFeed$))
    .map(([openProfileId, state, privateFeed]) => {
      return xs
        .fromPromise(getPrivateMessageWithRecipient(privateFeed, openProfileId))
        .map((rootMsgId: string | undefined) =>
          getConversationPassProps(
            state.selfFeedId,
            state.selfAvatarUrl,
            openProfileId,
            rootMsgId,
          ),
        );
    })
    .flatten()
    .map(passProps => {
      return {
        type: 'push',
        layout: {
          component: {
            name: Screens.Conversation,
            passProps,
            options: conversationNavOpts,
          },
        },
      } as Command;
    });

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
    toThreadExpandCW$,
    toRawMsg$,
    goToPrivateChat$,
    pop$,
  );
}
