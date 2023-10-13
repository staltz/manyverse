// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import between from 'xstream-between';
import sample from 'xstream-sample';
import flattenSequentially from 'xstream/extra/flattenSequentially';
import {ReactSource} from '@cycle/react';
import {
  TextInputSelectionChangeEventData,
  NativeSyntheticEvent,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {NavSource} from 'cycle-native-navigation';
import {FeedId} from 'ssb-typescript';
import {Image} from '@staltz/react-native-image-crop-picker';
import {t} from '~frontend/drivers/localization';
import {GlobalEvent, AudioBlobComposed} from '~frontend/drivers/eventbus';
import {MAX_BLOB_SIZE} from '~frontend/ssb/utils/constants';
import {State, isPost, hasText, isReply, textUnderMaximumLength} from './model';
import saveWebFile from './web-paster';
import {FileLite} from './types';

const ImagePicker =
  Platform.OS !== 'web'
    ? require('@staltz/react-native-image-crop-picker')
    : null;

function arrayify(list: DataTransferItemList) {
  const arr = [];
  for (let i = 0; i < list.length; i++) {
    arr.push(list[i]);
  }
  return arr;
}

function validateFileSize(file: File): File {
  if (file.size > MAX_BLOB_SIZE) {
    throw new Error('File too large');
  }
  return file;
}

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  globalEvent$: Stream<GlobalEvent>,
  topBarBack$: Stream<any>,
  topBarDone$: Stream<any>,
  topBarOpenError$: Stream<any>,
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

  const attemptPublish$ = topBarDoneWithState$
    .filter((state) => state.previewing)
    .filter((state) => isPost(state) || isReply(state))
    .filter(hasText);

  const showTooLargeTextError$ = xs.merge(
    topBarOpenError$,
    attemptPublish$
      .filter((state) => !textUnderMaximumLength(state))
      .mapTo(null),
  );

  const willPublish$ = attemptPublish$.filter(textUnderMaximumLength);

  const publishPost$ = willPublish$.filter(isPost);
  const publishReply$ = willPublish$.filter(isReply);

  const selectionChange$ = reactSource
    .select('composeInput')
    .events<NativeSyntheticEvent<TextInputSelectionChangeEventData>>(
      'selectionChange',
    );
  const focusInput$ = reactSource.select('composeInput').events('focus');
  const blurInput$ = reactSource.select('composeInput').events('blur');

  const selectedDesktopFile$ = reactSource
    .select('add-picture-desktop')
    .events('change')
    .map((ev) => ev.target.files[0] as File | undefined)
    .filter((file) => !!file)
    .map(validateFileSize) as Stream<File>;

  const pastedDesktopFile$ = reactSource
    .select('composeInput')
    .events<ClipboardEvent>('paste')
    .map((ev) => [ev, ev.clipboardData?.items] as const)
    .filter(([_, items]) => (items?.length ?? 0) > 0)
    .map(([ev, items]) =>
      xs.fromArray(
        arrayify(items!).map((item) => {
          const file = item.getAsFile();
          if (file) ev.preventDefault();
          return file;
        }),
      ),
    )
    .flatten()
    .filter((file) => !!file)
    .map(validateFileSize)
    .map((file) => xs.fromPromise(saveWebFile(file!)))
    .compose(flattenSequentially);

  const droppedDesktopFile$ = reactSource
    .select('composeInput')
    .events<DragEvent>('drop')
    .map((ev) => ev.dataTransfer?.items)
    .filter((items) => (items?.length ?? 0) > 0)
    .map((items) =>
      xs.fromArray(arrayify(items!).map((item) => item.getAsFile())),
    )
    .flatten()
    .filter((file) => !!file?.path)
    .map(validateFileSize) as Stream<File>;

  const attemptToAddDesktopFile$ = xs.merge(
    selectedDesktopFile$,
    pastedDesktopFile$,
    droppedDesktopFile$,
  ) as Stream<FileLite>;

  const addedDesktopFile$ = attemptToAddDesktopFile$.replaceError(
    () => attemptToAddDesktopFile$,
  );

  const attemptErrors$ = attemptToAddDesktopFile$.filter(
    () => false,
  ) as Stream<unknown>;

  const showTooLargeAttachmentError$ = (
    attemptErrors$.replaceError((err) =>
      attemptErrors$.startWith(err),
    ) as Stream<Error>
  ).filter((err) => err.message === 'File too large');

  const addedMobilePicture$ = xs
    .merge(
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
    )
    .map((image) => ({
      ...image,
      name: image.path.split('/').pop() ?? 'image.jpg',
      type: 'image/jpeg',
    }));

  const addPicture$: Stream<FileLite> =
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
      .events<string>('changeText'),

    // Android, iOS, and web behave slightly different
    updateSelection$: Platform.select({
      // TextInput Selection events that happen after focus and before blur
      ios: selectionChange$
        .compose(between(focusInput$, blurInput$))
        .map((ev) => ev.nativeEvent.selection),

      // TextInput Selection events, but ignore the first event caused by a focus
      web: focusInput$
        .startWith('initial focus')
        .map(() =>
          selectionChange$.drop(1).map((ev) => ev.nativeEvent.selection),
        )
        .flatten(),

      // TextInput Selection events, no tricks on Android
      default: selectionChange$.map((ev) => ev.nativeEvent.selection),
    }),

    chooseSuggestion$: reactSource
      .select('suggestions-menu')
      .events<
        | {type: 'mention'; id: FeedId}
        | {type: 'hashtag'; id: string}
        | {type: 'emoji'; id: string}
      >('select'),

    cancelSuggestion$: reactSource
      .select('suggestions-menu')
      .events('backdropPress'),

    openContentWarning$: reactSource
      .select('content-warning')
      .events<null>('press'),

    toggleContentWarningPreview$: reactSource
      .select('content-warning-preview')
      .events<null>('pressToggle'),

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

    showTooLargeAttachmentError$,

    showTooLargeTextError$,

    exit$: xs.merge(publishPost$, publishReply$, back$),
  };
}
