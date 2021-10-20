// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {Response as RecorderResponse} from '../../drivers/recorder';
import {t} from '../../drivers/localization';
import {DialogSource} from '../../drivers/dialogs';
import {Palette} from '../../global-styles/palette';
import {State} from './model';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  dialogSource: DialogSource,
  recorderEvent$: Stream<RecorderResponse>,
  state$: Stream<State>,
) {
  const requestStartRecording$ = reactSource
    .select('audio-recorder')
    .events('pressStart');

  const responseStartRecording$ = recorderEvent$
    .filter((ev) => ev.type === 'recording')
    .mapTo(null);

  const requestStopRecording$ = reactSource
    .select('audio-recorder')
    .events('pressStop');

  const responseStopRecording$ = recorderEvent$.filter(
    (ev) => ev.type === 'recorded',
  );

  const responsePreparedRecording$ = recorderEvent$.filter(
    (ev) => ev.type === 'prepared',
  ) as Stream<{path: string}>;

  const meterEvent$ = recorderEvent$
    .map((ev) => {
      if (ev.type === 'meter') return ev.value;
      else return null;
    })
    .filter((x) => x !== null) as Stream<number>;

  const backWithState$ = xs
    .merge(
      navSource.backPress(),
      reactSource.select('topbar').events('pressBack'),
    )
    .compose(sample(state$));

  const backDuringIdle$ = backWithState$.filter(
    (state) => state.status === 'idle',
  );

  const backWithConfirmedDiscard$ = backWithState$
    .filter((state) => state.status !== 'idle')
    .map(() =>
      dialogSource.alert(
        t('compose_audio.dialogs.discard.title'),
        t('compose_audio.dialogs.discard.question'),
        {
          ...Palette.dialogColors,
          positiveText: t(
            'compose_audio.call_to_action.discard_recording.label',
          ),
          positiveColor: Palette.textNegative,
          negativeText: t('call_to_action.cancel'),
          negativeColor: Palette.textDialogStrong,
        },
      ),
    )
    .flatten()
    .filter((answer) => answer.action === 'actionPositive');

  const discardRecording$ = xs.merge(
    reactSource.select('discard').events('press'),
    backWithConfirmedDiscard$,
  ) as Stream<any>;

  const submitRecording$ = reactSource
    .select('ready')
    .events('press') as Stream<any>;

  return {
    requestStartRecording$,
    responseStartRecording$,
    requestStopRecording$,
    responseStopRecording$,
    responsePreparedRecording$,
    meterEvent$,
    backDuringIdle$,
    backWithConfirmedDiscard$,
    discardRecording$,
    submitRecording$,
  };
}
