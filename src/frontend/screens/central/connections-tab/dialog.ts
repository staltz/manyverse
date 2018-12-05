/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {DialogSource} from '../../../drivers/dialogs';
import {Palette} from '../../../global-styles/palette';

export type Actions = {
  noteDhtInvite$: Stream<any>;
};

export default function dialog(actions: Actions, dialogSource: DialogSource) {
  return {
    addNoteFromDialog$: actions.noteDhtInvite$
      .map(() =>
        dialogSource.prompt(
          'Add note',
          'Write a private (just for yourself) note about this invite code. ' +
            'For example: "This is for Alice"',
          {
            contentColor: Palette.textWeak,
            positiveColor: Palette.text,
            positiveText: 'Add',
            negativeColor: Palette.text,
            negativeText: 'Cancel',
          },
        ),
      )
      .flatten()
      .filter(res => res.action === 'actionPositive')
      .map(res => (res as any).text as string),
  };
}
