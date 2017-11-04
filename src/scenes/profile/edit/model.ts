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
import {Reducer} from 'cycle-onionify';
import {About} from '../../../ssb/types';

export type State = {
  about: About;
  newName?: string;
  newDescription?: string;
};

export type Actions = {
  changeName$: Stream<string>;
  changeDescription$: Stream<string>;
  dataToSave$: Stream<any>;
};

export default function model<A extends Actions>(
  actions: A,
): Stream<Reducer<State>> {
  const changeNameReducer$ = actions.changeName$.map(
    newName =>
      function changeNameReducer(prev: State): State {
        return {...prev, newName};
      },
  );

  const changeDescriptionReducer$ = actions.changeDescription$.map(
    newDescription =>
      function changeDescriptionReducer(prev: State): State {
        return {...prev, newDescription};
      },
  );

  const saveReducer$ = actions.dataToSave$.mapTo(function saveReducer(
    prev: State,
  ): State {
    const next = {about: prev.about};
    if (prev.newName) {
      next.about.name = prev.newName;
    }
    if (prev.newDescription) {
      next.about.description = prev.newDescription;
    }
    return next;
  });

  return xs.merge(changeNameReducer$, changeDescriptionReducer$);
}
