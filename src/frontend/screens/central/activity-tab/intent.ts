/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

  return {
    refreshFeed$,
    goToThread$,
    goToProfile$,
  };
}
