/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {Toast, Duration as ToastDuration} from '../../drivers/toast';
import {t} from '../../drivers/localization';
import {SSBSource} from '../../drivers/ssb';
const urlParse = require('url-parse');

interface Actions {
  handleUriConsumeAlias$: Stream<string>;
}

export default function toast(actions: Actions, ssbSource: SSBSource) {
  const consumeAliasResponseToast$ = actions.handleUriConsumeAlias$
    .map((uri) => {
      const alias = urlParse(uri, true).query!.alias;
      return ssbSource.consumeAliasResponse$.map((feedId) => {
        if (feedId) {
          return {
            type: 'show' as const,
            flavor: 'success',
            message: t('connections.toasts.connected_to_alias', {alias}),
            duration: ToastDuration.SHORT,
          } as Toast;
        } else {
          return {
            type: 'show' as const,
            flavor: 'failure',
            message: t('connections.toasts.not_connected_to_alias', {alias}),
            duration: ToastDuration.SHORT,
          } as Toast;
        }
      });
    })
    .flatten();

  return consumeAliasResponseToast$;
}
