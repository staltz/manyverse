/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {DialogSource} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {Req} from '../../drivers/ssb';
import {Palette} from '../../global-styles/palette';
const urlParse = require('url-parse');
const Ref = require('ssb-ref');

interface Actions {
  handleUriClaimInvite$: Stream<string>;
  handleUriStartHttpAuth$: Stream<string>;
  handleUriConsumeAlias$: Stream<string>;
  connectToPeer$: Stream<string>;
}

export default function ssb(
  initialWait$: Stream<any>,
  actions: Actions,
  dialogSource: DialogSource,
) {
  const consumeInviteUri$ = actions.handleUriClaimInvite$.map(
    (uri) => ({type: 'httpInviteClient.claim', uri} as Req),
  );

  const startHttpAuthUri$ = actions.handleUriStartHttpAuth$
    .map((uri) => {
      const query = urlParse(uri, true).query;
      const msaddr = query.multiserverAddress;
      const room = msaddr ? Ref.toAddress(msaddr).host : '';
      const roomid = query.sid && Ref.isFeed(query.sid) ? query.sid : false;
      if (!roomid) return xs.never();

      return dialogSource
        .alert(
          t('connections.dialogs.sign_in_with_ssb.server_initiated.title'),
          t(
            'connections.dialogs.sign_in_with_ssb.server_initiated.description',
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
        .mapTo({type: 'httpAuthClient.signIn', uri} as Req);
    })
    .flatten();

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
