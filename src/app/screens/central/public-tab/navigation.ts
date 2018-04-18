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

import xs, {Stream} from 'xstream';
import {FeedId, MsgId} from 'ssb-typescript';
import {Command, ShowModalCommand} from 'cycle-native-navigation';
import {navOptions as composeScreenNavOptions} from '../../compose';
import {navOptions as profileScreenNavOptions} from '../../profile';
import {navOptions as threadScreenNavOptions} from '../../thread';
import {Screens} from '../../..';

export type Actions = {
  goToCompose$: Stream<any>;
  goToProfile$: Stream<{authorFeedId: FeedId}>;
  goToThread$: Stream<{rootMsgId: MsgId}>;
};

export default function navigation(actions: Actions): Stream<Command> {
  const toCompose$ = actions.goToCompose$.map(
    () =>
      ({
        type: 'showModal',
        animated: true,
        animationType: 'slide-up',
        ...composeScreenNavOptions(),
      } as Command),
  );

  const toProfile$ = actions.goToProfile$.map(
    ev =>
      ({
        type: 'push',
        animated: true,
        animationType: 'slide-horizontal',
        passProps: {
          feedId: ev.authorFeedId,
        },
        ...profileScreenNavOptions(),
      } as Command),
  );

  const toThread$ = actions.goToThread$.map(
    ev =>
      ({
        type: 'push',
        animated: true,
        animationType: 'slide-horizontal',
        passProps: {
          rootMsgId: ev.rootMsgId,
        },
        ...threadScreenNavOptions(),
      } as Command),
  );

  return xs.merge(toCompose$, toProfile$, toThread$);
}
