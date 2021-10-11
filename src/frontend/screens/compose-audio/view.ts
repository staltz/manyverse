// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View} from 'react-native';
import {t} from '../../drivers/localization';
import AudioPlayer from '../../components/AudioPlayer';
import AudioRecorder from '../../components/AudioRecorder';
import TopBar from '../../components/TopBar';
import Button from '../../components/Button';
import {State} from './model';
import {styles} from './styles';
const blobIdToUrl = require('ssb-serve-blobs/id-to-url');

export default function view(state$: Stream<State>) {
  return state$.map((state) => {
    return h(View, {style: styles.container}, [
      h(TopBar, {sel: 'topbar', title: t('compose_audio.title')}),

      h(View, {style: styles.container}, [
        state.status === 'recorded'
          ? h(AudioPlayer, {
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
