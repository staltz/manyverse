/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId, Msg, MsgId, PostContent} from 'ssb-typescript';
import {isReplyPostMsg} from 'ssb-typescript/utils';
import {Command} from 'cycle-native-navigation';
import {
  navOptions as threadScreenNavOpts,
  Props as ThreadProps,
} from '../thread';
import {navOptions as profileScreenNavOpts} from '../profile';
import {Props as ProfileProps} from '../profile/props';
import {Screens} from '../enums';
import {State} from './model';

interface Actions {
  goBack$: Stream<any>;
  goToThread$: Stream<MsgId | Msg<PostContent>>;
  goToAccount$: Stream<FeedId>;
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

  const toProfile$ = actions.goToAccount$.compose(sampleCombine(state$)).map(
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

  return xs.merge(back$, toThread$, toProfile$);
}
