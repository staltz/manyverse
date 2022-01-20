// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ReactSource} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';

export default function intent(reactSource: ReactSource) {
  const refreshFeed$ = reactSource
    .select('activityList')
    .events<unknown>('refresh');

  const goToThread$ = reactSource
    .select('activityList')
    .events<Msg>('pressMention');

  const goToProfile$ = reactSource
    .select('activityList')
    .events<FeedId>('pressFollow');

  const inspectConnectionAttempt$ = reactSource
    .select('activityList')
    .events<FeedId>('pressConnectionAttempt');

  return {
    refreshFeed$,
    goToThread$,
    goToProfile$,
    inspectConnectionAttempt$,
  };
}
