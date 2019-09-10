/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import between from 'xstream-between';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {DialogSource} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';
import {State} from './model';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  topBarBack$: Stream<any>,
  topBarPreviewToggle$: Stream<any>,
  topBarDone$: Stream<any>,
  state$: Stream<State>,
  dialogSource: DialogSource,
) {
  const back$ = xs
    .merge(navSource.backPress(), topBarBack$)
    .compose(between(navSource.didAppear(), navSource.didDisappear()));

  const backWithoutDialog$ = back$
    .compose(sample(state$))
    .filter(state => !state.postText.length);

  const backWithDialog = back$
    .compose(sample(state$))
    .filter(state => state.postText.length > 0)
    .map(() =>
      dialogSource.alert('', 'Save draft?', {
        positiveText: 'Save',
        positiveColor: Palette.text,
        negativeText: 'Delete',
        negativeColor: Palette.textNegative,
      }),
    )
    .flatten();

  return {
    publishMsg$: topBarDone$
      .compose(sample(state$))
      .filter(state => state.postText.length > 0)
      .map(state => ({
        text: state.postText,
        contentWarning: state.contentWarning,
      })),

    togglePreview$: topBarPreviewToggle$,

    updatePostText$: reactSource
      .select('composeInput')
      .events('changeText') as Stream<string>,

    openContentWarning$: reactSource
      .select('content-warning')
      .events('press') as Stream<null>,

    addPicture$: xs.merge(
      reactSource
        .select('open-camera')
        .events('press')
        .map(() =>
          xs
            .fromPromise(ImagePicker.openCamera({
              cropping: false,
              multiple: false,
              compressImageMaxWidth: 1080,
              compressImageMaxHeight: 1920,
              mediaType: 'photo',
            }) as Promise<Image>)
            .replaceError(() => xs.never()),
        )
        .flatten(),

      reactSource
        .select('add-picture')
        .events('press')
        .map(() =>
          xs
            .fromPromise(ImagePicker.openPicker({
              cropping: false,
              multiple: false,
              compressImageMaxWidth: 1080,
              compressImageMaxHeight: 1920,
              mediaType: 'photo',
            }) as Promise<Image>)
            .replaceError(() => xs.never()),
        )
        .flatten(),
    ),

    exit$: backWithoutDialog$,

    exitSavingDraft$: backWithDialog.filter(
      res => res.action === 'actionPositive',
    ),

    exitDeletingDraft$: backWithDialog.filter(
      res => res.action === 'actionNegative',
    ),
  };
}
