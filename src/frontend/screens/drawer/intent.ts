/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {ReactSource} from '@cycle/react';

export default function intent(source: ReactSource) {
  return {
    goToSelfProfile$: source
      .select('self-profile')
      .events('press')
      .mapTo(null),

    goToAbout$: source
      .select('about')
      .events('press')
      .mapTo(null),

    goToThanks$: source
      .select('thanks')
      .events('press')
      .mapTo(null),

    emailBugReport$: source
      .select('bug-report')
      .events('press')
      .mapTo(null),

    goToBackup$: source
      .select('backup')
      .events('press')
      .mapTo(null),

    showRawDatabase$: source
      .select('raw-db')
      .events('press')
      .mapTo(null),
  };
}
