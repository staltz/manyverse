/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import between from 'xstream-between';
import {NavSource} from 'cycle-native-navigation';
import {DialogSource} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {ReactSource} from '@cycle/react';

export default function dialogs(
  navSource: NavSource,
  screenSource: ReactSource,
  dialogSource: DialogSource,
) {
  const back$ = xs.merge(
    navSource.backPress(),
    screenSource.select('topbar').events('pressBack'),
  );

  return back$
    .compose(between(navSource.didAppear(), navSource.didDisappear()))
    .map(() =>
      dialogSource.alert(
        t('profile_edit.dialogs.discard.title'),
        t('profile_edit.dialogs.discard.question'),
        {
          positiveText: t('profile_edit.call_to_action.discard'),
          positiveColor: Palette.textNegative,
          negativeText: t('call_to_action.cancel'),
          negativeColor: Palette.text,
        },
      ),
    )
    .flatten();
}
