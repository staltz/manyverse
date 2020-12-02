/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {DialogSource} from '../../../drivers/dialogs';
import {t} from '../../../drivers/localization';
import {Palette} from '../../../global-styles/palette';

export type Actions = {
  noteDhtInvite$: Stream<any>;
};

export default function dialog(actions: Actions, dialogSource: DialogSource) {
  return {
    addNoteFromDialog$: actions.noteDhtInvite$
      .map(() =>
        dialogSource.prompt(
          t('connections.notes.add.title'),
          t('connections.notes.add.description'),
          {
            contentColor: Palette.colors.comet6,
            positiveColor: Palette.colors.comet8,
            positiveText: t('call_to_action.add'),
            negativeColor: Palette.colors.comet8,
            negativeText: t('call_to_action.cancel'),
          },
        ),
      )
      .flatten()
      .filter((res) => res.action === 'actionPositive')
      .map((res) => (res as any).text as string),
  };
}
