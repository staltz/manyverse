// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
const roomUtils = require('ssb-room-client/utils');
import {Req} from '~frontend/drivers/ssb';

export interface Actions {
  room1InviteDone$: Stream<string>;
  room2InviteDone$: Stream<string>;
  miscInviteDone$: Stream<string>;
}

export default function ssb(actions: Actions) {
  const acceptInvite$ = actions.miscInviteDone$.map(
    (inviteCode) =>
      ({
        type: 'invite.accept',
        invite: inviteCode,
      } as Req),
  );

  const acceptRoomInvite$ = actions.room1InviteDone$.map(
    (inviteCode) =>
      ({
        type: 'conn.rememberConnect',
        address: roomUtils.inviteToAddress(inviteCode),
        data: {type: 'room'},
      } as Req),
  );

  const consumeInviteUri$ = actions.room2InviteDone$.map(
    (uri) => ({type: 'httpInviteClient.claim', uri} as Req),
  );

  return xs.merge(acceptInvite$, acceptRoomInvite$, consumeInviteUri$);
}
