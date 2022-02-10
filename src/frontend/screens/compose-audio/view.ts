// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {createElement as $} from 'react';
import {Platform, View} from 'react-native';
import {t} from '~frontend/drivers/localization';
import AudioPlayer from '~frontend/components/AudioPlayer';
import AudioRecorder from '~frontend/components/AudioRecorder';
import TopBar from '~frontend/components/TopBar';
import Button from '~frontend/components/Button';
import {State} from './model';
import {styles} from './styles';
const blobIdToUrl = require('ssb-serve-blobs/id-to-url');

export default function view(state$: Stream<State>) {
  return state$.map((state) => {
    return h(View, {style: styles.screen}, [
      h(TopBar, {sel: 'topbar', title: t('compose_audio.title')}),

      h(View, {style: styles.container}, [
        state.status === 'recorded'
          ? Platform.OS === 'web'
            ? $('audio', {
                src: blobIdToUrl(state.blobId),
                controls: true,
                style: {width: '80%'},
              })
            : h(AudioPlayer, {
                src: blobIdToUrl(state.blobId),
                style: styles.audioPlayer,
              })
          : h(AudioRecorder, {
              sel: 'audio-recorder',
              status:
                state.status === 'idle'
                  ? 'idle'
                  : state.status === 'recording'
                  ? 'active'
                  : state.status === 'finalizing'
                  ? 'loading'
                  : null!,
              recording: state.duration,
              loudness: state.loudness,
            }),
      ]),

      h(
        View,
        {style: styles.footer},
        state.status === 'recorded'
          ? [
              h(Button, {
                sel: 'discard',
                style: styles.discardButton,
                text: t('compose_audio.call_to_action.discard_recording.label'),
                accessible: true,
                accessibilityLabel: t(
                  'compose_audio.call_to_action.discard_recording.accessibility_label',
                ),
              }),

              h(Button, {
                sel: 'ready',
                style: styles.doneButton,
                text: t('compose_audio.call_to_action.submit_recording.label'),
                strong: true,
                accessible: true,
                accessibilityLabel: t(
                  'compose_audio.call_to_action.submit_recording.accessibility_label',
                ),
              }),
            ]
          : [],
      ),
    ]);
  });
}
