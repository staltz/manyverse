/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {ReactSource} from '@cycle/react';
import {blobsStorageOptions, hopsOptions} from './model';
import {NavSource} from 'cycle-native-navigation';

export default function intent(
  screenSource: ReactSource,
  navSource: NavSource,
) {
  return {
    toggleFollowEvents$: screenSource
      .select('show-follows')
      .events('valueChange'),

    toggleDetailedLogs$: screenSource
      .select('detailed-logs')
      .events('valueChange'),

    updateHops$: screenSource
      .select('hops')
      .events('change')
      .map((i) => {
        const opt = hopsOptions[i];
        if (opt === '1') return 1;
        if (opt === '2') return 2;
        if (opt === '3') return 3;
        if (opt === '4') return 4;
        if (opt === 'unlimited') return 999;
        return 999 as number;
      }),

    updateBlobsStorage$: screenSource
      .select('blobs-storage')
      .events('change')
      .map((i) => {
        const opt = blobsStorageOptions[i];
        if (opt === '100MB') return 100e6;
        if (opt === '250MB') return 250e6;
        if (opt === '500MB') return 500e6;
        if (opt === '1GB') return 1e9;
        if (opt === '2GB') return 2e9;
        if (opt === '5GB') return 5e9;
        if (opt === '10GB') return 10e9;
        if (opt === '30GB') return 30e9;
        if (opt === 'unlimited') return -1;
        return -1 as number;
      }),

    emailBugReport$: screenSource.select('bug-report').events('press'),

    goBack$: xs.merge(
      navSource.backPress(),
      screenSource.select('topbar').events('pressBack'),
    ),

    goToBackup$: screenSource.select('backup').events('press'),

    goToLibraries$: screenSource.select('libraries').events('press'),

    goToThanks$: screenSource.select('thanks').events('press'),

    goToAbout$: screenSource.select('about').events('press'),
  };
}
