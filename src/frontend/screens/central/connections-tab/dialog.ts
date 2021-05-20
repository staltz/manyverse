/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {DialogSource} from '../../../drivers/dialogs';
import {t} from '../../../drivers/localization';
import {Palette} from '../../../global-styles/palette';
import {PeerKV} from '../../../ssb/types';
const Ref = require('ssb-ref');

export type Actions = {
  noteDhtInvite$: Stream<any>;
  signInRoom$: Stream<PeerKV>;
};

export default function dialog(actions: Actions, dialogSource: DialogSource) {
  const addNoteFromDialog$ = actions.noteDhtInvite$
    .map(() =>
      dialogSource.prompt(
        t('connections.notes.add.title'),
        t('connections.notes.add.description'),
        {
          contentColor: Palette.colors.comet6,
          positiveColor: Palette.colors.comet8,
          positiveText: t('call_to_action.add'),
          negativeColor: Palette.colors.comet8,
          negativeText: t('call_to_action.cancel'),
        },
      ),
    )
    .flatten()
    .filter((res) => res.action === 'actionPositive')
    .map((res) => (res as any).text as string);

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
            contentColor: Palette.colors.comet6,
            positiveColor: Palette.colors.comet8,
            positiveText: t('call_to_action.yes'),
            negativeColor: Palette.colors.comet8,
            negativeText: t('call_to_action.no'),
          },
        )
        .filter((res) => res.action === 'actionPositive')
        .mapTo(roomid);
    })
    .flatten();

  return {
    addNoteFromDialog$,
    confirmedSignInRoom$,
  };
}
