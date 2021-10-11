// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';

export default function intent(reactSource: ReactSource) {
  const refreshFeed$ = reactSource
    .select('activityList')
    .events('refresh') as Stream<any>;

  const goToThread$ = reactSource
    .select('activityList')
    .events('pressMention') as Stream<Msg>;

  const goToProfile$ = reactSource
    .select('activityList')
    .events('pressFollow') as Stream<FeedId>;

  const inspectConnectionAttempt$ = reactSource
    .select('activityList')
    .events('pressConnectionAttempt') as Stream<FeedId>;

  return {
    refreshFeed$,
    goToThread$,
    goToProfile$,
    inspectConnectionAttempt$,
  };
}
