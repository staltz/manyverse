/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

import {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {Command} from 'cycle-native-navigation';
import {navigatorStyle as profileNavigatorStyle} from '../../profile/styles';

export type Actions = {
  goToProfile$: Stream<{authorFeedId: FeedId}>;
};

export default function navigation(actions: Actions): Stream<Command> {
  return actions.goToProfile$.map(
    ev =>
      ({
        type: 'push',
        screen: 'mmmmm.Profile',
        navigatorStyle: profileNavigatorStyle,
        animated: true,
        animationType: 'slide-horizontal',
        passProps: {
          feedId: ev.authorFeedId,
        },
      } as Command),
  );
}
