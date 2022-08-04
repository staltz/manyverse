// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {SSBSource} from '~frontend/drivers/ssb';

export interface State {
  progress: number;
  estimateDone: number;
  startedAt: number;
  done: boolean;
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export default function model(ssbSource: SSBSource) {
  const initReducer$ = xs.of(function initReducer(prev: State): State {
    return {
      progress: 0,
      estimateDone: 0,
      startedAt: Date.now(),
      done: false,
    };
  });

  const updateProgressReducer$ = xs
    .periodic(1000)
    .take(1)
    .map(() => ssbSource.compactionProgress$)
    .flatten()
    .map(
      (stats) =>
        function updateProgressReducer(prev: State): State {
          const progress = stats.percent;
          const rateOfProgress = progress / (Date.now() - prev.startedAt);
          const remaining = 1 - progress;
          let estimateDone = remaining / rateOfProgress;
          // No outlier estimates:
          if (isNaN(estimateDone)) estimateDone = 0;
          if (estimateDone < 0) estimateDone = 0;
          if (estimateDone > ONE_DAY) estimateDone = 0;
          return {
            progress,
            estimateDone,
            done: stats.done,
            startedAt: prev.startedAt,
          };
        },
    );

  return xs.merge(initReducer$, updateProgressReducer$);
}
