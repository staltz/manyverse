/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import between from 'xstream-between';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {DialogSource} from '../../drivers/dialogs';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Alias} from '../../ssb/types';
import {canonicalizeAliasURL} from '../../ssb/utils/alias';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  dialogSource: DialogSource,
) {
  const back$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events('pressBack'),
  );

  const discardChanges$ = back$
    .compose(between(navSource.didAppear(), navSource.didDisappear()))
    .map(() =>
      dialogSource.alert(
        t('profile_edit.dialogs.discard.title'),
        t('profile_edit.dialogs.discard.question'),
        {
          positiveText: t('profile_edit.call_to_action.discard'),
          positiveColor: Palette.textNegative,
          negativeText: t('call_to_action.cancel'),
          negativeColor: Palette.colors.comet8,
        },
      ),
    )
    .flatten()
    .filter((res) => res.action === 'actionPositive');

  const registerAlias$ = reactSource.select('aliases').events('register');

  const removeAlias$ = reactSource
    .select('aliases')
    .events('remove')
    .map((a: Alias) =>
      dialogSource
        .alert(
          '',
          t('profile_edit.dialogs.remove_alias.description', {
            alias: canonicalizeAliasURL(a.aliasURL),
          }),
          {
            positiveText: t('call_to_action.remove'),
            positiveColor: Palette.textNegative,
            negativeText: t('call_to_action.cancel'),
            negativeColor: Palette.colors.comet8,
          },
        )
        .filter((res) => res.action === 'actionPositive')
        .mapTo(a),
    )
    .flatten();

  const changeName$ = reactSource.select('name').events('changeText');

  const changeDescription$ = reactSource
    .select('description')
    .events('changeText');

  const changeAvatar$ = reactSource
    .select('avatar')
    .events('press')
    .map(() =>
      xs
        .fromPromise(
          ImagePicker.openPicker({
            width: 240,
            height: 240,
            cropping: true,
            multiple: false,
            cropperCircleOverlay: true,
            mediaType: 'photo',
          }) as Promise<Image>,
        )
        .replaceError(() => xs.never()),
    )
    .flatten();

  const save$ = reactSource.select('save').events('press');

  return {
    changeName$,
    changeDescription$,
    changeAvatar$,
    save$,
    discardChanges$,
    registerAlias$,
    removeAlias$,
  };
}
