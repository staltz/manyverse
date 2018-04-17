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

import xs, {Stream, Listener} from 'xstream';
import {Command, PushCommand} from 'cycle-native-navigation';
import {navigatorStyle as composeNavigatorStyle} from '../compose/styles';
import {navigatorStyle as editProfileNavStyle} from './edit';
import {Screens} from '../..';

export type NavigationActions = {
  goToCompose$: Stream<null>;
  goToEdit$: Stream<null>;
};

export default function navigation(
  actions: NavigationActions,
): Stream<Command> {
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

  const toEdit$ = actions.goToEdit$.mapTo(
    {
      type: 'push',
      screen: Screens.ProfileEdit,
      title: 'Edit profile',
      overrideBackPress: true,
      navigatorStyle: editProfileNavStyle,
    } as PushCommand,
  );

  return xs.merge(toCompose$, toEdit$);
}
