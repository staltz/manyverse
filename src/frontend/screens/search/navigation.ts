// SPDX-FileCopyrightText: 2021-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import sample from 'xstream-sample';
import {FeedId, Msg, MsgId, PostContent} from 'ssb-typescript';
import {isReplyPostMsg} from 'ssb-typescript/utils';
import {Command} from 'cycle-native-navigation';
import {Reactions} from '~frontend/ssb/types';
import {
  navOptions as threadScreenNavOpts,
  Props as ThreadProps,
} from '~frontend/screens/thread';
import {navOptions as profileScreenNavOpts} from '~frontend/screens/profile';
import {Props as ProfileProps} from '~frontend/screens/profile/props';
import {Props as ComposeProps} from '~frontend/screens/compose/props';
import {navOptions as accountsScreenNavOptions} from '~frontend/screens/accounts/layout';
import {navOptions as composeScreenNavOptions} from '~frontend/screens/compose';
import {Props as AccountProps} from '~frontend/screens/accounts';
import {navOptions as rawMsgScreenNavOpts} from '~frontend/screens/raw-msg';
import {Screens} from '~frontend/screens/enums';
import {State} from './model';

interface Actions {
  goBack$: Stream<any>;
  goToThread$: Stream<MsgId | Msg<PostContent>>;
  goToThreadExpandCW$: Stream<Msg>;
  goToThreadReplies$: Stream<Msg>;
  goToProfile$: Stream<FeedId>;
  goToRawMsg$: Stream<Msg>;
  goToAccounts$: Stream<{
    title: string;
    accounts: Array<FeedId> | Reactions;
  }>;
  goToCompose$: Stream<any>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const back$ = actions.goBack$.mapTo({type: 'pop'} as Command);

  const toThread$ = actions.goToThread$
    .compose(sampleCombine(state$))
    .map(([x, state]) => {
      if (typeof x === 'string') {
        const rootMsgId = x;
        return {
          type: 'push',
          layout: {
            component: {
              name: Screens.Thread,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                lastSessionTimestamp: state.lastSessionTimestamp,
                rootMsgId,
              } as ThreadProps,
              options: threadScreenNavOpts,
            },
          },
        } as Command;
      } else {
        const msg = x;
        return {
          type: 'push',
          layout: {
            component: {
              name: Screens.Thread,
              passProps: {
                selfFeedId: state.selfFeedId,
                selfAvatarUrl: state.selfAvatarUrl,
                lastSessionTimestamp: state.lastSessionTimestamp,
                ...(isReplyPostMsg(msg)
                  ? {
                      rootMsgId: msg.value.content.root,
                      scrollTo: msg.key,
                    }
                  : {
                      rootMsg: msg,
                    }),
              } as ThreadProps,
              options: threadScreenNavOpts,
            },
          },
        } as Command;
      }
    });

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

  const toProfile$ = actions.goToProfile$.compose(sampleCombine(state$)).map(
    ([feedId, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              feedId,
            } as ProfileProps,
            options: profileScreenNavOpts,
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
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
            } as AccountProps,
            options: accountsScreenNavOptions,
          },
        },
      } as Command),
  );

  const toCompose$ = actions.goToCompose$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Compose,
            passProps: {
              text:
                !state.hasComposeDraft &&
                state.searchResults?.type === 'HashtagResults'
                  ? state.query + '\n\n'
                  : undefined,
              selfAvatarUrl: state.selfAvatarUrl,
              selfFeedId: state.selfFeedId,
            } as ComposeProps,
            options: composeScreenNavOptions,
          },
        },
      } as Command),
  );

  return xs.merge(
    back$,
    toThread$,
    toThreadReplies$,
    toThreadExpandCW$,
    toProfile$,
    toRawMsg$,
    toAccounts$,
    toCompose$,
  );
}
