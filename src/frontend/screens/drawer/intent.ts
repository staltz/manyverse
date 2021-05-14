/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {ReactSource} from '@cycle/react';

export default function intent(source: ReactSource) {
  return {
    goToSelfProfile$: xs
      .merge(
        source.select('self-profile').events('press'),
        source.select('header').events('press'),
      )
      .mapTo(null),

    emailBugReport$: source.select('bug-report').events('press').mapTo(null),

    goToSettings$: source.select('settings').events('press').mapTo(null),

    showRawDatabase$: source.select('raw-db').events('press').mapTo(null),
  };
}
