// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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

    openTranslate$: source.select('translate').events('press').mapTo(null),

    goToSettings$: source.select('settings').events('press').mapTo(null),

    showRawDatabase$: source.select('raw-db').events('press').mapTo(null),
  };
}
