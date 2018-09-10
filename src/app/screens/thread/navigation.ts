/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {FeedId} from 'ssb-typescript';
import {Command, NavSource, PopCommand} from 'cycle-native-navigation';
import {State} from './model';
import {Screens} from '../..';
import {navOptions as profileScreenNavOptions} from '../profile';

export type Actions = {
  goToProfile$: Stream<{authorFeedId: FeedId}>;
};

export default function navigation(
  actions: Actions,
  navSource: NavSource,
  state$: Stream<State>,
): Stream<Command> {
  const toProfile$ = actions.goToProfile$.compose(sampleCombine(state$)).map(
    ([ev, state]) =>
      ({
        type: 'push',
        layout: {
          component: {
            name: Screens.Profile,
            passProps: {
              selfFeedId: state.selfFeedId,
              feedId: ev.authorFeedId,
            },
            options: profileScreenNavOptions,
          },
        },
      } as Command),
  );

  const pop$ = navSource.backPress().mapTo(
    {
      type: 'pop',
    } as PopCommand,
  );

  return xs.merge(toProfile$, pop$);
}
