/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {DialogSource} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';
import {Image} from 'react-native-image-crop-picker';

export type Actions = {
  openContentWarning$: Stream<any>;
  addPicture$: Stream<Image>;
};

export default function dialog(actions: Actions, dialogSource: DialogSource) {
  return {
    updateContentWarning$: actions.openContentWarning$
      .map(() =>
        dialogSource.prompt(
          'Content warning',
          'If your post contains sensitive topics, ' +
            'please add a short note to alert people of them.',
          {
            contentColor: Palette.textWeak,
            positiveColor: Palette.text,
            positiveText: 'Done',
            negativeColor: Palette.text,
            negativeText: 'Cancel',
          },
        ),
      )
      .flatten()
      .filter(res => res.action === 'actionPositive')
      .map(res => (res as any).text as string),

    addPictureWithCaption$: actions.addPicture$
      .map(image =>
        dialogSource
          .prompt(
            'Caption',
            'Add some description of this picture, ' +
              'particularly for the visually impaired.',
            {
              contentColor: Palette.textWeak,
              positiveColor: Palette.text,
              positiveText: 'Done',
            },
          )
          .map(res => ({caption: (res as any).text, image})),
      )
      .flatten(),
  };
}
