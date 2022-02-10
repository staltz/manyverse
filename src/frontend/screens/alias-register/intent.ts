// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {t} from '~frontend/drivers/localization';
import {DialogSource} from '~frontend/drivers/dialogs';
import {Palette} from '~frontend/global-styles/palette';

export function intent(
  navSource: NavSource,
  reactSource: ReactSource,
  dialogSource: DialogSource,
) {
  const back$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events('pressBack'),
    reactSource.select('back-from-success').events('press'),
  );

  const tryAgain$ = reactSource.select('try-again').events('press');

  const registerAlias$ = reactSource
    .select('list')
    .events('pressServer')
    .map((event: {roomId: string; host: string}) => {
      return dialogSource
        .prompt(
          void 0,
          t('register_alias.dialogs.input_alias.description', {
            host: event.host,
          }),
          {
            ...Palette.dialogColors,
            positiveText: t('call_to_action.done'),
            negativeText: t('call_to_action.cancel'),
          },
        )
        .filter((res) => res.action === 'actionPositive')
        .map((res) => ({
          roomId: event.roomId,
          alias: (res as any).text as string,
        }));
    })
    .flatten();

  return {
    back$,
    tryAgain$,
    registerAlias$,
  };
}
