// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Command} from 'cycle-native-navigation';
import {FeedId} from 'ssb-typescript';
import {Screens} from '~frontend/screens/enums';
import {navOptions as profileScreenNavOpts} from '~frontend/screens/profile/layout';
import {Props as ProfileProps} from '~frontend/screens/profile/props';
import {navOptions as compactScreenNavOpts} from '~frontend/screens/compact/layout';
import {Props as CompactProps} from '~frontend/screens/compact/props';
import {State} from './model';

export interface Actions {
  goBack$: Stream<any>;
  goToProfile$: Stream<FeedId>;
  goToCompact$: Stream<any>;
}

export default function navigationCommands(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const back$ = actions.goBack$.mapTo({type: 'pop'} as Command);

  const toProfile$ = actions.goToProfile$.compose(sampleCombine(state$)).map(
    ([feedId, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              feedId,
            } as ProfileProps,
            options: profileScreenNavOpts,
          },
        },
      } as Command),
  );

  const toCompact$ = actions.goToCompact$.map(
    () =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Compact,
            passProps: {
              continuation: false,
            } as CompactProps,
            options: compactScreenNavOpts,
          },
        },
      } as Command),
  );

  return xs.merge(back$, toProfile$, toCompact$);
}
