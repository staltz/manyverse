// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import between from 'xstream-between';
import {Platform} from 'react-native';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {Image} from 'react-native-image-crop-picker';
const ImagePicker =
  Platform.OS !== 'web' ? require('react-native-image-crop-picker') : null;
import {AlertAction, DialogSource} from '~frontend/drivers/dialogs';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {State} from './model';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  dialogSource: DialogSource,
  state$: Stream<State>,
) {
  const back$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events('pressBack'),
  );

  const discardChanges$ = back$
    .compose(between(navSource.didAppear(), navSource.didDisappear()))
    .compose(sample(state$))
    .map((state) => {
      const {newName, newAvatar, newDescription, about} = state;
      const somethingChanged =
        (!!newName && newName !== about.name) ||
        !!newAvatar ||
        (!!newDescription && newDescription !== about.description);
      if (somethingChanged) {
        return dialogSource.alert(
          t('profile_edit.dialogs.discard.title'),
          t('profile_edit.dialogs.discard.question'),
          {
            ...Palette.dialogColors,
            positiveText: t('profile_edit.call_to_action.discard'),
            positiveColor: Palette.textNegative,
            negativeText: t('call_to_action.cancel'),
            negativeColor: Palette.textDialogStrong,
          },
        );
      } else {
        return xs.of({action: 'actionPositive'} as AlertAction);
      }
    })
    .flatten()
    .filter((res) => res.action === 'actionPositive');

  const changeName$ = reactSource.select('name').events('changeText');

  const changeDescription$ = reactSource
    .select('description')
    .events('changeText');

  const changeAvatar$ =
    Platform.OS === 'web'
      ? reactSource
          .select('avatar-desktop')
          .events('change')
          .map((ev) => ev.target.files[0])
      : reactSource
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
  };
}
