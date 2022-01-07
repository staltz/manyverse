// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import between from 'xstream-between';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {
  TextInputSelectionChangeEventData,
  NativeSyntheticEvent,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {NavSource} from 'cycle-native-navigation';
import {FeedId} from 'ssb-typescript';
import {Image} from 'react-native-image-crop-picker';
import {t} from '../../drivers/localization';
import {GlobalEvent, AudioBlobComposed} from '../../drivers/eventbus';
import {State, isPost, hasText, isReply} from './model';
const ImagePicker =
  Platform.OS !== 'web' ? require('react-native-image-crop-picker') : null;

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  globalEvent$: Stream<GlobalEvent>,
  topBarBack$: Stream<any>,
  topBarDone$: Stream<any>,
  state$: Stream<State>,
) {
  const topBarDoneWithState$ = topBarDone$.compose(sample(state$));

  const back$ = xs
    .merge(navSource.backPress(), topBarBack$)
    .compose(sample(state$))
    .filter((state) => !state.previewing);

  const disablePreview$ = xs
    .merge(navSource.backPress(), topBarBack$)
    .compose(sample(state$))
    .filter((state) => state.previewing);

  const enablePreview$ = topBarDoneWithState$.filter(
    (state) => !state.previewing && state.postText.length > 0,
  );

  const publishPost$ = topBarDoneWithState$
    .filter((state) => state.previewing)
    .filter(isPost)
    .filter(hasText);

  const publishReply$ = topBarDoneWithState$
    .filter((state) => state.previewing)
    .filter(isReply)
    .filter(hasText);

  const selectionChange$ = reactSource
    .select('composeInput')
    .events('selectionChange') as Stream<
    NativeSyntheticEvent<TextInputSelectionChangeEventData>
  >;
  const focusInput$ = reactSource.select('composeInput').events('focus');
  const blurInput$ = reactSource.select('composeInput').events('blur');

  const addedDesktopFile$ = reactSource
    .select('add-picture-desktop')
    .events('change')
    .map((ev) => ev.target.files[0] as File);

  const addedMobilePicture$ = xs.merge(
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
  );

  const addPicture$: Stream<File | Image> =
    Platform.OS === 'web'
      ? addedDesktopFile$.filter((file) => file.type.startsWith('image/'))
      : addedMobilePicture$;

  return {
    publishPost$,

    publishReply$,

    disablePreview$,

    enablePreview$,

    updatePostText$: reactSource
      .select('composeInput')
      .events('changeText') as Stream<string>,

    // Android and iOS behave slightly different
    updateSelection$: Platform.select({
      // TextInput Selection events that happen after focus and before blur
      ios: selectionChange$
        .compose(between(focusInput$, blurInput$))
        .map((ev) => ev.nativeEvent.selection),

      // TextInput Selection events, but ignore the first event caused by a focus
      default: focusInput$
        .startWith('initial focus')
        .map(() =>
          selectionChange$.drop(1).map((ev) => ev.nativeEvent.selection),
        )
        .flatten(),
    }),

    chooseMention$: reactSource
      .select('mentions-menu')
      .events('select') as Stream<FeedId>,

    cancelMention$: reactSource.select('mentions-menu').events('backdropPress'),

    openContentWarning$: reactSource
      .select('content-warning')
      .events('press') as Stream<null>,

    toggleContentWarningPreview$: reactSource
      .select('content-warning-preview')
      .events('pressToggle') as Stream<null>,

    goToComposeAudio$: reactSource
      .select('record-audio')
      .events('press')
      .map(() =>
        Platform.OS === 'android'
          ? xs.fromPromise(
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                  title: t(
                    'compose.call_to_action.record_audio.permission_request.title',
                  ),
                  message: t(
                    'compose.call_to_action.record_audio.permission_request.message',
                  ),
                  buttonNeutral: t(
                    'compose.call_to_action.record_audio.permission_request.neutral',
                  ),
                  buttonNegative: t(
                    'compose.call_to_action.record_audio.permission_request.negative',
                  ),
                  buttonPositive: t(
                    'compose.call_to_action.record_audio.permission_request.positive',
                  ),
                },
              ),
            )
          : xs.of('granted'),
      )
      .flatten()
      .filter((ev) => ev === 'granted') as Stream<'granted'>,

    addPicture$,

    addAudio$: globalEvent$.filter(
      (ev): ev is AudioBlobComposed => ev.type === 'audioBlobComposed',
    ),

    attachAudio$: addedDesktopFile$.filter((file) =>
      file.type.startsWith('audio/'),
    ),

    exit$: xs.merge(publishPost$, publishReply$, back$),
  };
}
