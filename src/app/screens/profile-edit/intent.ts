/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
