/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {Req} from '../../drivers/ssb';
const roomUtils = require('ssb-room/utils');

export type Actions = {
  dhtDone$: Stream<string>;
  roomDone$: Stream<string>;
  normalDone$: Stream<string>;
};

export default function ssb(actions: Actions) {
  const acceptInvite$ = actions.normalDone$.map(
    inviteCode =>
      ({
        type: 'invite.accept',
        invite: inviteCode,
      } as Req),
  );

  const acceptRoomInvite$ = actions.roomDone$.map(
    inviteCode =>
      ({
        type: 'conn.rememberConnect',
        address: roomUtils.inviteToAddress(inviteCode),
        data: {type: 'room'},
      } as Req),
  );

  const acceptDhtInvite$ = actions.dhtDone$.map(
    inviteCode =>
      ({
        type: 'dhtInvite.accept',
        invite: inviteCode,
      } as Req),
  );

  return xs.merge(acceptInvite$, acceptRoomInvite$, acceptDhtInvite$);
}
