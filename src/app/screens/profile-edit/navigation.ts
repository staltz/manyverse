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
import {Command, PopCommand} from 'cycle-native-navigation';

export type NavigationActions = {
  save$: Stream<any>;
  discardChanges$: Stream<any>;
};

export default function navigation(
  actions: NavigationActions,
): Stream<Command> {
  const goBackDiscarding$ = actions.discardChanges$.map(
    () => ({type: 'pop'} as PopCommand),
  );

  const goBackSaving$ = actions.save$.map(() => ({type: 'pop'} as PopCommand));

  return xs.merge(goBackDiscarding$, goBackSaving$);
}
