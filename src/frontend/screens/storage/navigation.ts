// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {Command, NavSource} from 'cycle-native-navigation';
import {FeedId} from 'ssb-typescript';
import {State} from './model';

import {Screens} from '~frontend/screens/enums';
import {navOptions as profileScreenNavOpts} from '~frontend/screens/profile/layout';
import {Props} from '~frontend/screens/profile/props';

export interface Actions {
  goBack$: Stream<any>;
  goToProfile$: Stream<FeedId>;
}

export default function navigationCommands(
  actions: Actions,
  navSource: NavSource,
  state$: Stream<State>,
): Stream<Command> {
  const back$ = xs.merge(navSource.backPress(), actions.goBack$).mapTo({
    type: 'pop',
  } as Command);

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
            } as Props,
            options: profileScreenNavOpts,
          },
        },
      } as Command),
  );

  return xs.merge(back$, toProfile$);
}
