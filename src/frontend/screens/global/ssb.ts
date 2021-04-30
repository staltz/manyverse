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
const parse = require('url-parse');
const Ref = require('ssb-ref');

export default function ssb(
  initialWait$: Stream<any>,
  linkingSource: Stream<string>,
  dialogSource: DialogSource,
) {
  const consumeInviteUri$ = linkingSource
    .filter((uri) => parse(uri, true).query.action === 'claim-http-invite')
    .map((uri) => ({type: 'roomClient.consumeInviteUri', uri} as Req));

  const startHttpAuthUri$ = linkingSource
    .filter((uri) => parse(uri, true).query.action === 'start-http-auth')
    .map((uri) => {
      const query = parse(uri, true).query;
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
        .mapTo({type: 'roomSignIn', uri} as Req);
    })
    .flatten();

  const consumeAliasUri$ = linkingSource
    .filter((uri) => parse(uri, true).query.action === 'consume-alias')
    .map((uri) => ({type: 'roomClient.consumeAliasUri', uri} as Req));

  return initialWait$
    .take(1)
    .map(() => xs.merge(consumeInviteUri$, startHttpAuthUri$, consumeAliasUri$))
    .flatten();
}
