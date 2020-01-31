/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId} from 'ssb-typescript';
import {State} from './model';
import {Command} from 'cycle-native-navigation';
import {navOptions as profileScreenNavOptions} from '../profile';
import {Screens} from '../..';

type Actions = {
  goBack$: Stream<any>;
  goToProfile$: Stream<FeedId>;
};

export default function navigation(actions: Actions, state$: Stream<State>) {
  const pop$ = actions.goBack$.mapTo({
    type: 'popToRoot',
  } as Command);

  const toProfile$ = actions.goToProfile$.compose(sampleCombine(state$)).map(
    ([id, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              feedId: id,
            },
            options: profileScreenNavOptions,
          },
        },
      } as Command),
  );

  return xs.merge(pop$, toProfile$);
}
