// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Req} from '../../drivers/ssb';

interface Actions {
  handleUriClaimInvite$: Stream<string>;
  handleUriStartHttpAuth$: Stream<string>;
  handleUriConsumeAlias$: Stream<string>;
  connectToPeer$: Stream<string>;
  confirmedSignInRoom$: Stream<string>;
}

export default function ssb(initialWait$: Stream<any>, actions: Actions) {
  const consumeInviteUri$ = actions.handleUriClaimInvite$.map(
    (uri) => ({type: 'httpInviteClient.claim', uri} as Req),
  );

  const startHttpAuthUri$ = actions.confirmedSignInRoom$.map(
    (uri) => ({type: 'httpAuthClient.signIn', uri} as Req),
  );

  const consumeAliasUri$ = actions.handleUriConsumeAlias$.map(
    (uri) => ({type: 'roomClient.consumeAliasUri', uri} as Req),
  );

  const connectReq$ = actions.connectToPeer$.map(
    (address) => ({type: 'conn.connect', address} as Req),
  );

  return initialWait$
    .take(1)
    .map(() =>
      xs.merge(
        consumeInviteUri$,
        startHttpAuthUri$,
        consumeAliasUri$,
        connectReq$,
      ),
    )
    .flatten();
}
