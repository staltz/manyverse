// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
const urlParse = require('url-parse');
import {Toast, Duration as ToastDuration} from '~frontend/drivers/toast';
import {t} from '~frontend/drivers/localization';
import {SSBSource} from '~frontend/drivers/ssb';

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
