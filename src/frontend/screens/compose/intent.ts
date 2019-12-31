/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import between from 'xstream-between';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {
  TextInputSelectionChangeEventData,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import {NavSource} from 'cycle-native-navigation';
import {FeedId} from 'ssb-typescript';
import ImagePicker, {Image} from 'react-native-image-crop-picker';
import {DialogSource} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';
import {State, isPost, isTextEmpty, hasText, isReply} from './model';

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

  const backPostWithoutDialog$ = back$
    .compose(sample(state$))
    .filter(isPost)
    .filter(isTextEmpty);

  const backPostWithDialog$ = back$
    .compose(sample(state$))
    .filter(isPost)
    .filter(hasText)
    .map(() =>
      dialogSource.alert('', 'Save draft?', {
        positiveText: 'Save',
        positiveColor: Palette.text,
        negativeText: 'Delete',
        negativeColor: Palette.textNegative,
      }),
    )
    .flatten();

  const backReply$ = back$.compose(sample(state$)).filter(isReply);

  const publishPost$ = topBarDone$
    .compose(sample(state$))
    .filter(isPost)
    .filter(hasText);

  const publishReply$ = topBarDone$
    .compose(sample(state$))
    .filter(isReply)
    .filter(hasText);

  const selectionChange$ = reactSource
    .select('composeInput')
    .events('selectionChange') as Stream<
    NativeSyntheticEvent<TextInputSelectionChangeEventData>
  >;
  const focusInput$ = reactSource.select('composeInput').events('focus');
  const blurInput$ = reactSource.select('composeInput').events('blur');

  return {
    publishPost$,

    publishReply$,

    togglePreview$: topBarPreviewToggle$,

    updatePostText$: reactSource
      .select('composeInput')
      .events('changeText') as Stream<string>,

    updateMentionQuery$: reactSource
      .select('mentionInput')
      .events('changeText') as Stream<string>,

    // Android and iOS behave slightly different
    updateSelection$: Platform.select({
      // TextInput Selection events that happen after focus and before blur
      ios: selectionChange$
        .compose(between(focusInput$, blurInput$))
        .map(ev => ev.nativeEvent.selection),

      // TextInput Selection events, but ignore the first event caused by a focus
      default: focusInput$
        .startWith('initial focus')
        .map(() => selectionChange$.drop(1).map(ev => ev.nativeEvent.selection))
        .flatten(),
    }),

    chooseMention$: reactSource
      .select('suggestions')
      .events('pressAccount') as Stream<{id: FeedId; name: string}>,

    cancelMention$: reactSource.select('mentions-cancel').events('press'),

    openContentWarning$: reactSource
      .select('content-warning')
      .events('press') as Stream<null>,

    addPicture$: xs.merge(
      reactSource
        .select('open-camera')
        .events('press')
        .map(() =>
          xs
            .fromPromise(
              ImagePicker.openCamera({
                cropping: false,
                multiple: false,
                compressImageMaxWidth: 1080,
                compressImageMaxHeight: 1920,
                compressImageQuality: 0.88,
                mediaType: 'photo',
              }) as Promise<Image>,
            )
            .replaceError(() => xs.never()),
        )
        .flatten(),

      reactSource
        .select('add-picture')
        .events('press')
        .map(() =>
          xs
            .fromPromise(
              ImagePicker.openPicker({
                cropping: false,
                multiple: false,
                compressImageMaxWidth: 1080,
                compressImageMaxHeight: 1920,
                compressImageQuality: 0.88,
                mediaType: 'photo',
              }) as Promise<Image>,
            )
            .replaceError(() => xs.never()),
        )
        .flatten(),
    ),

    exitPost$: backPostWithoutDialog$,

    exitReply$: backReply$,

    exitSavingPostDraft$: backPostWithDialog$.filter(
      res => res.action === 'actionPositive',
    ),

    exitDeletingPostDraft$: backPostWithDialog$.filter(
      res => res.action === 'actionNegative',
    ),

    exitOfAnyKind$: xs.merge(
      publishPost$,
      publishReply$,
      backPostWithoutDialog$,
      backReply$,
      backPostWithDialog$,
    ),
  };
}
