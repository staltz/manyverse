/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {AcceptInviteReq, AcceptDhtInviteReq} from '../../drivers/ssb';

export type Actions = {
  dhtDone$: Stream<string>;
  normalDone$: Stream<string>;
};

export default function ssb(actions: Actions) {
  const acceptInvite$ = actions.normalDone$.map(
    inviteCode =>
      ({
        type: 'invite.accept',
        invite: inviteCode,
      } as AcceptInviteReq),
  );

  const acceptDhtInvite$ = actions.dhtDone$.map(
    inviteCode =>
      ({
        type: 'dhtInvite.accept',
        invite: inviteCode,
      } as AcceptDhtInviteReq),
  );

  return xs.merge(acceptInvite$, acceptDhtInvite$);
}
