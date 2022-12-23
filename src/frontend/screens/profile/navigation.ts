// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId, Msg} from 'ssb-typescript';
import {Command, PopCommand} from 'cycle-native-navigation';
import {Reactions, MsgAndExtras} from '~frontend/ssb/types';
import {Screens} from '~frontend/screens/enums';
import {navOptions as composeScreenNavOpts} from '~frontend/screens/compose';
import {Props as ComposeProps} from '~frontend/screens/compose/props';
import {navOptions as editProfileScreenNavOpts} from '~frontend/screens/profile-edit';
import {Props as ProfileEditProps} from '~frontend/screens/profile-edit/props';
import {navOptions as bioScreenNavOpts} from '~frontend/screens/biography';
import {navOptions as threadScreenNavOpts} from '~frontend/screens/thread/layout';
import {Props as ThreadProps} from '~frontend/screens/thread/props';
import {navOptions as accountsScreenNavOptions} from '~frontend/screens/accounts/layout';
import {navOptions as rawMsgScreenNavOpts} from '~frontend/screens/raw-msg';
import {Props as AccountProps} from '~frontend/screens/accounts';
import {Props as ConversationProps} from '~frontend/screens/conversation/props';
import {navOptions as conversationNavOpts} from '~frontend/screens/conversation/layout';
import {navOptions as profileScreenNavOpts} from './layout';
import {Props} from './props';
import {State} from './model';

export interface Actions {
  goBack$: Stream<any>;
  goToCompose$: Stream<null>;
  goToEdit$: Stream<null>;
  goToBio$: Stream<any>;
  goToAccounts$: Stream<{
    title: string;
    accounts: Array<FeedId> | Reactions;
    description?: string;
  }>;
  goToProfile$: Stream<{authorFeedId: FeedId}>;
  goToThread$: Stream<MsgAndExtras>;
  goToThreadReplies$: Stream<MsgAndExtras>;
  goToThreadExpandCW$: Stream<MsgAndExtras>;
  goToRawMsg$: Stream<Msg>;
  goToPrivateChat$: Stream<string | null>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toCompose$ = actions.goToCompose$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Compose,
            passProps: {
              selfAvatarUrl: state.selfAvatarUrl,
              selfFeedId: state.selfFeedId,
            } as ComposeProps,
            options: composeScreenNavOpts,
          },
        },
      } as Command),
  );

  const toBio$ = actions.goToBio$.compose(sample(state$)).map(
    (state) =>
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
    (state) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.ProfileEdit,
            passProps: {
              about: state.about,
              aliases: state.aliases,
            } as ProfileEditProps,
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
              accounts: ev.accounts,
              description: ev.description,
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
              lastSessionTimestamp: state.lastSessionTimestamp,
            } as ThreadProps,
            options: threadScreenNavOpts,
          },
        },
      } as Command),
  );

  const toThreadReplies$ = actions.goToThreadReplies$
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
                lastSessionTimestamp: state.lastSessionTimestamp,
                scrollToBottom: true,
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
                lastSessionTimestamp: state.lastSessionTimestamp,
              } as ThreadProps,
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

  const goToPrivateChat$ = actions.goToPrivateChat$
    .compose(sampleCombine(state$))
    .map(([privateMsgId, state]) => {
      const hasPrivateMsgId = privateMsgId && privateMsgId !== 'new';
      return {
        type: 'push',
        layout: {
          component: {
            name: Screens.Conversation,
            passProps: {
              goBackActionType: 'pop',
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              rootMsgId: hasPrivateMsgId ? privateMsgId : undefined,
              recps: hasPrivateMsgId ? undefined : [{id: state.displayFeedId}],
            } as ConversationProps,
            options: conversationNavOpts,
          },
        },
      } as Command;
    });

  const pop$ = actions.goBack$.mapTo({type: 'pop'} as PopCommand);

  return xs.merge(
    toCompose$,
    toBio$,
    toEdit$,
    toAccounts$,
    toOtherProfile$,
    toThread$,
    toThreadReplies$,
    toThreadExpandCW$,
    toRawMsg$,
    goToPrivateChat$,
    pop$,
  );
}
