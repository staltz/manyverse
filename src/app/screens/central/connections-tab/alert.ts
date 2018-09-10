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
import {State} from './model';
import {Command as AlertCommand} from 'cycle-native-alert';

export type Actions = {
  showLANHelp$: Stream<any>;
  showDHTHelp$: Stream<any>;
  showPubHelp$: Stream<any>;
};

export default function alert(
  actions: Actions,
  state$: Stream<State>,
): Stream<AlertCommand> {
  return state$
    .map(state =>
      xs.merge(
        actions.showLANHelp$.mapTo({
          title: 'Wi-Fi',
          message:
            (state.lanEnabled ? '(ENABLED)' : '(Turn on Wi-Fi to use this)') +
            '\n\nConnect with friends in the same Local Area Network, ' +
            'in other words, friends using the same Wi-Fi.',
          buttons: [{text: 'OK', id: 'okay'}],
        }),
        actions.showDHTHelp$.mapTo({
          title: 'Internet P2P',
          message:
            (state.internetEnabled ? '(ENABLED)' : '(Go online to use this)') +
            '\n\nConnect directly to friends currently online, ' +
            'using a peer-to-peer technology called "Distributed Hash Table".',
          buttons: [{text: 'OK', id: 'okay'}],
        }),
        actions.showPubHelp$.mapTo({
          title: 'Internet servers',
          message:
            (state.internetEnabled ? '(ENABLED)' : '(Go online to use this)') +
            '\n\nConnect to a so-called "Pub server" owned by some friend, ' +
            'containing the latest data from multiple accounts.',
          buttons: [{text: 'OK', id: 'okay'}],
        }),
      ),
    )
    .flatten();
}
