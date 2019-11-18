/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {AlertAction} from '../../drivers/dialogs';

export default function intent(
  source: ReactSource,
  dialogRes$: Stream<AlertAction>,
) {
  return {
    changeName$: source.select('name').events('changeText'),

    changeDescription$: source.select('description').events('changeText'),

    changeAvatar$: source
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
      .flatten(),

    save$: source.select('save').events('press'),

    discardChanges$: dialogRes$.filter(res => res.action === 'actionPositive'),
  };
}
