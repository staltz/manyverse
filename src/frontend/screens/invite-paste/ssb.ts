// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Req} from '../../drivers/ssb';
const roomUtils = require('ssb-room-client/utils');

export interface Actions {
  room1Done$: Stream<string>;
  room2Done$: Stream<string>;
  normalDone$: Stream<string>;
}

export default function ssb(actions: Actions) {
  const acceptInvite$ = actions.normalDone$.map(
    (inviteCode) =>
      ({
        type: 'invite.accept',
        invite: inviteCode,
      } as Req),
  );

  const acceptRoomInvite$ = actions.room1Done$.map(
    (inviteCode) =>
      ({
        type: 'conn.rememberConnect',
        address: roomUtils.inviteToAddress(inviteCode),
        data: {type: 'room'},
      } as Req),
  );

  const consumeInviteUri$ = actions.room2Done$.map(
    (uri) => ({type: 'httpInviteClient.claim', uri} as Req),
  );

  return xs.merge(acceptInvite$, acceptRoomInvite$, consumeInviteUri$);
}
