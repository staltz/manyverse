/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {Command, PushCommand} from 'cycle-native-navigation';
import {navOptions as profileScreenNavOptions} from '../profile';
import {Props as ProfileProps} from '../profile/props';
import {navOptions as rawDatabaseScreenNavOptions} from '../raw-db';
import {Screens} from '../enums';
import {State} from './model';

interface Actions {
  goToSelfProfile$: Stream<any>;
  showRawDatabase$: Stream<any>;
  changeTab$: Stream<any>;
}

export default function navigation(
  actions: Actions,
  state$: Stream<State>,
): Stream<Command> {
  const toSelfProfile$ = actions.goToSelfProfile$.compose(sample(state$)).map(
    (state) =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              selfAvatarUrl: state.selfAvatarUrl,
              feedId: state.selfFeedId,
            } as ProfileProps,
            options: profileScreenNavOptions,
          },
        },
      } as PushCommand),
  );

  const toRawDatabase$ = actions.showRawDatabase$.map(
    () =>
      ({
        type: 'push',
        id: 'mainstack',
        layout: {
          component: {
            name: Screens.RawDatabase,
            options: rawDatabaseScreenNavOptions,
          },
        },
      } as PushCommand),
  );

  const popToRoot$ = actions.changeTab$.map(
    () => ({type: 'popToRoot'} as Command),
  );

  return xs.merge(toSelfProfile$, toRawDatabase$, popToRoot$);
}
