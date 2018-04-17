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
import {Command} from 'cycle-native-navigation';
import {navigatorStyle as composeNavigatorStyle} from '../../compose/styles';
import {navigatorStyle as profileNavigatorStyle} from '../../profile/styles';
import {navigatorStyle as threadNavigatorStyle} from '../../thread/styles';
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
        screen: Screens.Compose,
        navigatorStyle: composeNavigatorStyle,
        navigatorButtons: {
          rightButtons: [{component: Screens.ComposePublishButton}],
        },
        animated: true,
        animationType: 'slide-up',
      } as Command),
  );

  const toProfile$ = actions.goToProfile$.map(
    ev =>
      ({
        type: 'push',
        screen: Screens.Profile,
        navigatorStyle: profileNavigatorStyle,
        animated: true,
        animationType: 'slide-horizontal',
        passProps: {
          feedId: ev.authorFeedId,
        },
      } as Command),
  );

  const toThread$ = actions.goToThread$.map(
    ev =>
      ({
        type: 'push',
        screen: Screens.Thread,
        navigatorStyle: threadNavigatorStyle,
        title: 'Thread',
        animated: true,
        animationType: 'slide-horizontal',
        passProps: {
          rootMsgId: ev.rootMsgId,
        },
      } as Command),
  );

  return xs.merge(toCompose$, toProfile$, toThread$);
}
