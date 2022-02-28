// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Command} from 'cycle-native-navigation';
import {FeedId, MsgId} from 'ssb-typescript';
import {Screens} from '~frontend/screens/enums';
import {navOptions as profileScreenNavOpts} from '~frontend/screens/profile';
import {Props as ProfileProps} from '~frontend/screens/profile/props';
import {navOptions as searchNavOpts} from '~frontend/screens/search/index';
import {Props as SearchProps} from '~frontend/screens/search/props';
import {
  navOptions as threadScreenNavOpts,
  Props as ThreadProps,
} from '~frontend/screens/thread';
import {State} from './model';

interface Actions {
  goToProfile$: Stream<{authorFeedId: FeedId}>;
  goToThread$: Stream<{rootMsgId: MsgId}>;
  goToSearch$: Stream<{query: string} | null>;
  handleUriConsumeAlias$: Stream<string>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toProfile$ = xs
    .merge(
      actions.goToProfile$.map((ev) => ev.authorFeedId),
      actions.handleUriConsumeAlias$.map((uri) =>
        new URL(uri).searchParams.get('userId'),
      ),
    )
    .compose(sampleCombine(state$))
    .filter(([_feedId, state]) => !!state.selfFeedId)
    .map(
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

  const toThread$ = actions.goToThread$
    .compose(sampleCombine(state$))
    .filter(([_ev, state]) => !!state.selfFeedId)
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
                rootMsgId: ev.rootMsgId,
                lastSessionTimestamp: state.lastSessionTimestamp ?? Infinity,
              } as ThreadProps,
              options: threadScreenNavOpts,
            },
          },
        } as Command),
    );

  const toSearch$ = actions.goToSearch$.compose(sampleCombine(state$)).map(
    ([ev, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Search,
            options: searchNavOpts,
            passProps: {
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              lastSessionTimestamp: state.lastSessionTimestamp,
              query: ev?.query ?? '',
            } as SearchProps,
          },
        },
      } as Command),
  );

  return xs.merge(toProfile$, toThread$, toSearch$);
}
