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
import {Command, PushCommand} from 'cycle-native-navigation';
import {State as ProfileState} from './scenes/profile/model';
import {State as CentralState} from './scenes/central/model';
import {ScreenID} from './main';

export type State = {
  profile: ProfileState;
  central: CentralState;
};

function isPushCommand(c: Command): c is PushCommand {
  return c.type === 'push';
}

export default function model(
  navCommand$: Stream<Command>
): Stream<Reducer<State>> {
  const setProfileDisplayFeedId$ = navCommand$
    .filter(isPushCommand)
    .filter(command => (command.screen as ScreenID) === 'mmmmm.Profile')
    .map(
      command =>
        function setProfileDisplayFeedId(prevState: State): State {
          if (command.passProps && command.passProps.feedId) {
            return {
              ...prevState,
              profile: {
                ...prevState.profile,
                displayFeedId: command.passProps.feedId
              }
            };
          } else {
            return {
              ...prevState,
              profile: {
                ...prevState.profile,
                displayFeedId: prevState.profile.selfFeedId
              }
            };
          }
        }
    );

  return setProfileDisplayFeedId$;
}
