// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {SSBSource} from '~frontend/drivers/ssb';

export interface State {
  migrationProgress: number;
  indexingProgress: number;
  combinedProgress: number;
  checkpointCombinedProgress: number;
  checkpoint: number;
  recentEstimates: Array<number>;
  estimateProgressDone: number;
}

const CHECKPOINT_INTERVAL = 10e3; // ms

function updateEstimateProgressDone_mutating(state: State) {
  const now = Date.now();
  if (state.combinedProgress <= 0 || state.combinedProgress >= 1) {
    state.estimateProgressDone = 0;
    state.recentEstimates = [];
    state.checkpoint = now;
  } else if (state.checkpoint + CHECKPOINT_INTERVAL < now) {
    const rateOfProgress =
      (state.combinedProgress - state.checkpointCombinedProgress) /
      (now - state.checkpoint);
    const remaining = 1 - state.combinedProgress;
    if (state.combinedProgress > state.checkpointCombinedProgress) {
      // Calculate a moving average of the last 6 estimates
      state.recentEstimates.push(remaining / rateOfProgress);
      if (state.recentEstimates.length > 3) state.recentEstimates.shift();
      state.estimateProgressDone =
        state.recentEstimates.reduce((acc, x) => acc + x, 0) /
        state.recentEstimates.length;
    }
    state.checkpointCombinedProgress = state.combinedProgress;
    state.checkpoint = now;
  }
}

function calcProgress(p1: number, p2: number) {
  if (p1 > 0 && p2 > 0) return (p1 + p2) * 0.5;
  else if (p1 > 0) return p1;
  else if (p2 > 0) return p2;
  else return 1;
}

export const INITIAL_STATE: State = {
  migrationProgress: 0,
  indexingProgress: 0,
  combinedProgress: 0,
  checkpointCombinedProgress: 0,
  checkpoint: Date.now(),
  recentEstimates: [],
  estimateProgressDone: 0,
};

export default function progressCalculation(ssbSource: SSBSource) {
  const migrationProgressReducer$ = ssbSource.migrationProgress$.map(
    (migrationProgress) =>
      function migrationProgressReducer(prev: State): State {
        const state: State = {
          ...prev,
          migrationProgress,
          combinedProgress: calcProgress(
            prev.indexingProgress,
            migrationProgress,
          ),
        };
        updateEstimateProgressDone_mutating(state);
        return state;
      },
  );

  const indexingProgressReducer$ = ssbSource.indexingProgress$.map(
    (indexingProgress) =>
      function indexingProgressReducer(prev: State): State {
        const state: State = {
          ...prev,
          indexingProgress,
          combinedProgress: calcProgress(
            indexingProgress,
            prev.migrationProgress,
          ),
        };
        updateEstimateProgressDone_mutating(state);
        return state;
      },
  );

  return xs.merge(migrationProgressReducer$, indexingProgressReducer$);
}
