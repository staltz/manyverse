/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Command} from 'cycle-native-asyncstorage';
import {StagedPeerKV} from '../../../drivers/ssb';
import {State} from './model';
import dropRepeats from 'xstream/extra/dropRepeats';

function isDhtInviteWithNote([_addr, data]: StagedPeerKV) {
  return !!data.note && data.type === 'dht';
}

export function noteStorageKeyFor([_addr, data]: StagedPeerKV) {
  return `dhtInviteNote:${data.key}`;
}

export default function asyncStorage(state$: Stream<State>) {
  const command$ = state$
    .compose(dropRepeats((s1, s2) => s1.stagedPeers === s2.stagedPeers))
    .filter(state => state.stagedPeers.some(isDhtInviteWithNote))
    .map((state: State) => {
      const keyValuePairs = state.stagedPeers
        .filter(isDhtInviteWithNote)
        .map(kv => [noteStorageKeyFor(kv), kv[1].note]);
      return {type: 'multiSet', keyValuePairs} as Command;
    });

  return command$;
}
