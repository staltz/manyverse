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
import {Command, DismissModalCommand} from 'cycle-native-navigation';

export type Actions = {
  publishMsg$: Stream<any>;
  quitFromKeyboard$: Stream<any>;
};

export default function navigation(actions: Actions): Stream<Command> {
  const goBack$ = xs.merge(actions.publishMsg$, actions.quitFromKeyboard$).map(
    () =>
      ({
        type: 'dismissModal',
        animationType: 'slide-down',
      } as DismissModalCommand),
  );

  return goBack$;
}
