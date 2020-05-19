/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from 'cycle-native-alert';
import {t} from '../../../drivers/localization';
import {State} from './model';

export type Actions = {
  showBluetoothHelp$: Stream<any>;
  showLANHelp$: Stream<any>;
  showDHTHelp$: Stream<any>;
  showPubHelp$: Stream<any>;
  infoClientDhtInvite$: Stream<any>;
  infoServerDhtInvite$: Stream<any>;
};

export default function alert(
  actions: Actions,
  state$: Stream<State>,
): Stream<AlertCommand> {
  return state$
    .map(state =>
      xs.merge(
        actions.showBluetoothHelp$.mapTo({
          title: t('connections.modes.bluetooth.title'),
          message:
            (state.bluetoothEnabled
              ? t('connections.modes.generic.enabled')
              : t('connections.modes.bluetooth.disabled')) +
            '\n\n' +
            t('connections.modes.bluetooth.description'),
          buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
        }),
        actions.showLANHelp$.mapTo({
          title: t('connections.modes.wifi.title'),
          message:
            (state.lanEnabled
              ? t('connections.modes.generic.enabled')
              : t('connections.modes.wifi.disabled')) +
            '\n\n' +
            t('connections.modes.wifi.description'),
          buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
        }),
        actions.showDHTHelp$.mapTo({
          title: t('connections.modes.p2p.title'),
          message:
            (state.internetEnabled
              ? t('connections.modes.generic.enabled')
              : t('connections.modes.p2p.disabled')) +
            '\n\n' +
            t('connections.modes.p2p.description'),
          buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
        }),
        actions.showPubHelp$.mapTo({
          title: t('connections.modes.servers.title'),
          message:
            (state.internetEnabled
              ? t('connections.modes.generic.enabled')
              : t('connections.modes.servers.disabled')) +
            '\n\n' +
            t('connections.modes.servers.description'),
          buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
        }),
        actions.infoClientDhtInvite$.mapTo({
          title: t('connections.modes.p2p.connecting'),
          message: t('connections.modes.p2p.searching_friend'),
          buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
        }),
        actions.infoServerDhtInvite$.mapTo({
          title: t('connections.modes.p2p.connecting'),
          message: t('connections.modes.p2p.waiting_friend'),
          buttons: [{text: t('call_to_action.ok'), id: 'okay'}],
        }),
      ),
    )
    .flatten();
}
