// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
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
  approvedCheckingNewVersion$: Stream<any>;
  rejectedCheckingNewVersion$: Stream<any>;
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

  const allowCheckingNewVersionReq$ = xs.merge(
    actions.approvedCheckingNewVersion$.map(
      () =>
        ({
          type: 'settings.allowCheckingNewVersion',
          allowCheckingNewVersion: true,
        } as Req),
    ),

    actions.rejectedCheckingNewVersion$.map(
      () =>
        ({
          type: 'settings.allowCheckingNewVersion',
          allowCheckingNewVersion: false,
        } as Req),
    ),
  );

  return initialWait$
    .take(1)
    .map(() =>
      xs.merge(
        consumeInviteUri$,
        startHttpAuthUri$,
        consumeAliasUri$,
        connectReq$,
        allowCheckingNewVersionReq$,
      ),
    )
    .flatten();
}
