// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import dropRepeatsByKeys from 'xstream-drop-repeats-by-keys';
import {ReactSource} from '@cycle/react';
import {HTTPSource} from '@cycle/http';
import {State} from './model';

export default function intent(
  reactSource: ReactSource,
  httpSource: HTTPSource,
  state$: Stream<State>,
) {
  const response$ = httpSource
    .select('latestversion')
    .flatten()
    .map((res) => res.body);

  const latestVersionResponse$ = response$.replaceError(() => response$);

  return {
    goToSelfProfile$: xs
      .merge(
        reactSource.select('self-profile').events('press'),
        reactSource.select('header').events('press'),
      )
      .mapTo(null),

    emailBugReport$: reactSource
      .select('bug-report')
      .events('press')
      .mapTo(null),

    openTranslate$: reactSource.select('translate').events('press').mapTo(null),

    goToSettings$: reactSource.select('settings').events('press').mapTo(null),

    goToStorage$: reactSource.select('storage').events('press').mapTo(null),

    showRawDatabase$: reactSource.select('raw-db').events('press').mapTo(null),

    checkNewVersion$: state$
      .compose(dropRepeatsByKeys(['allowCheckingNewVersion']))
      .filter((s) => s.allowCheckingNewVersion === true)
      .map(() => xs.periodic(1000 * 60 * 60 * 24).startWith(0))
      .flatten(),

    latestVersionResponse$,

    downloadNewVersion$: reactSource
      .select('new-version')
      .events('press')
      .mapTo(null),
  };
}
