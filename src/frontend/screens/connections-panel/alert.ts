// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Command as AlertCommand} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {State} from './model';

export interface Actions {
  showLANHelp$: Stream<any>;
  showPubHelp$: Stream<any>;
}

export default function alert(
  actions: Actions,
  state$: Stream<State>,
): Stream<AlertCommand> {
  return state$
    .map((state) =>
      xs.merge(
        actions.showLANHelp$.mapTo({
          type: 'alert' as const,
          title: t('connections.modes.wifi.title'),
          content:
            (state.lanEnabled
              ? t('connections.modes.generic.enabled')
              : t('connections.modes.wifi.disabled')) +
            '\n\n' +
            t('connections.modes.wifi.description'),
          options: {
            ...Palette.dialogColors,
            positiveColor: Palette.textDialogStrong,
            positiveText: t('call_to_action.ok'),
          },
        }),
        actions.showPubHelp$.mapTo({
          type: 'alert' as const,
          title: t('connections.modes.servers.title'),
          content:
            (state.internetEnabled
              ? t('connections.modes.generic.enabled')
              : t('connections.modes.servers.disabled')) +
            '\n\n' +
            t('connections.modes.servers.description'),
          options: {
            ...Palette.dialogColors,
            positiveColor: Palette.textDialogStrong,
            positiveText: t('call_to_action.ok'),
          },
        }),
      ),
    )
    .flatten();
}
