// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {DialogSource} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {PeerKV} from '../../ssb/types';
const Ref = require('ssb-ref');

export interface Actions {
  signInRoom$: Stream<PeerKV>;
}

export default function dialog(actions: Actions, dialogSource: DialogSource) {
  // Client-initiated SSB HTTP Auth
  const confirmedSignInRoom$ = actions.signInRoom$
    .map(([addr, data]) => {
      const room = data.name ?? Ref.toAddress(addr).host;
      if (!room) return xs.never<string>();
      const roomid: string | undefined =
        data.key ?? Ref.getKeyFromAddress(addr);
      if (!roomid) return xs.never<string>();

      return dialogSource
        .alert(
          t('connections.dialogs.sign_in_with_ssb.client_initiated.title'),
          t(
            'connections.dialogs.sign_in_with_ssb.client_initiated.description',
            {room, roomid},
          ),
          {
            ...Palette.dialogColors,
            positiveText: t('call_to_action.yes'),
            negativeText: t('call_to_action.no'),
          },
        )
        .filter((res) => res.action === 'actionPositive')
        .mapTo(roomid);
    })
    .flatten();

  return {
    confirmedSignInRoom$,
  };
}
