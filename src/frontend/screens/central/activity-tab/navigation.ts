/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId, Msg} from 'ssb-typescript';
import {isReplyPostMsg} from 'ssb-typescript/utils';
import {Command} from 'cycle-native-navigation';
import {
  navOptions as threadScreenNavOpts,
  Props as ThreadProps,
} from '../../thread';
import {navOptions as profileScreenNavOpts} from '../../profile';
import {Props as ProfileProps} from '../../profile/props';
import {State} from './model';
import {Screens} from '../../enums';

interface Actions {
  goToProfile$: Stream<FeedId>;
  goToThread$: Stream<Msg>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
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

  return xs.merge(toThread$, toProfile$);
}
