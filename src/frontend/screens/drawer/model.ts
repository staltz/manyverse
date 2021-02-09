/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
  migrationProgress: number;
  indexingProgress: number;
  combinedProgress: number;
  checkpointCombinedProgress: number;
  checkpoint: number;
  estimateProgressDone: number;
  selfAvatarUrl?: string;
  name?: string;
};

const CHECKPOINT_INTERVAL = 10e3; // ms

export function calcProgress(p1: number, p2: number) {
  if (p1 > 0 && p2 > 0) return (p1 + p2) * 0.5;
  else if (p1 > 0) return p1;
  else if (p2 > 0) return p2;
  else return 1;
}

export default function model(ssbSource: SSBSource): Stream<Reducer<State>> {
  const selfFeedId$ = ssbSource.selfFeedId$.take(1);

  const selfFeedIdReducer$ = selfFeedId$.map(
    (selfFeedId: FeedId) =>
      function selfFeedIdReducer(prev: State): State {
        if (!prev) {
          return {
            selfFeedId,
            migrationProgress: 0,
            indexingProgress: 0,
            combinedProgress: 0,
            checkpointCombinedProgress: 0,
            checkpoint: Date.now(),
            estimateProgressDone: 0,
          };
        } else {
          return {...prev, selfFeedId};
        }
      },
  );

  const aboutReducer$ = selfFeedId$
    .map((selfFeedId) => ssbSource.profileAboutLive$(selfFeedId))
    .flatten()
    .map(
      (about) =>
        function aboutReducer(prev: State): State {
          let name;
          if (!!about.name && about.name !== about.id) {
            name = about.name;
          }
          if (!prev) {
            return {
              selfFeedId: about.id,
              selfAvatarUrl: about.imageUrl,
              name,
              migrationProgress: 0,
              indexingProgress: 0,
              combinedProgress: 0,
              checkpointCombinedProgress: 0,
              estimateProgressDone: 0,
              checkpoint: Date.now(),
            };
          } else {
            return {
              ...prev,
              selfAvatarUrl: about.imageUrl,
              name,
            };
          }
        },
    );

  function updateEstimateProgressDone_mutating(state: State) {
    const now = Date.now();
    if (state.combinedProgress <= 0 || state.combinedProgress >= 1) {
      state.estimateProgressDone = 0;
      state.checkpoint = now;
    } else if (state.checkpoint + CHECKPOINT_INTERVAL < now) {
      const rateOfProgress =
        (state.combinedProgress - state.checkpointCombinedProgress) /
        (now - state.checkpoint);
      const remaining = 1 - state.combinedProgress;
      if (state.combinedProgress > state.checkpointCombinedProgress) {
        state.estimateProgressDone = remaining / rateOfProgress;
      }
      state.checkpointCombinedProgress = state.combinedProgress;
      state.checkpoint = now;
    }
  }

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

  return xs.merge(
    selfFeedIdReducer$,
    aboutReducer$,
    migrationProgressReducer$,
    indexingProgressReducer$,
  );
}
