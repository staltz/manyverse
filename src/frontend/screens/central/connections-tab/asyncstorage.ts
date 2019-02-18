/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command} from 'cycle-native-asyncstorage';
import {StagedPeerMetadata} from '../../../drivers/ssb';
import {State} from './model';
import dropRepeats from 'xstream/extra/dropRepeats';

function isDhtInviteWithNote(invite: StagedPeerMetadata) {
  return !!invite.note && invite.source === 'dht';
}

export function noteStorageKeyFor(invite: StagedPeerMetadata) {
  return `dhtInviteNote:${invite.key}`;
}

export default function asyncStorage(state$: Stream<State>) {
  const command$ = state$
    .compose(dropRepeats((s1, s2) => s1.stagedPeers === s2.stagedPeers))
    .filter(state => state.stagedPeers.some(isDhtInviteWithNote))
    .map(state => {
      const keyValuePairs = state.stagedPeers
        .filter(isDhtInviteWithNote)
        .map(peer => [noteStorageKeyFor(peer), peer.note]);
      return {type: 'multiSet', keyValuePairs} as Command;
    });

  return command$;
}
