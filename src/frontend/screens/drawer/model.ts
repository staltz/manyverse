// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {FeedId} from 'ssb-typescript';
import {Reducer} from '@cycle/state';
import {SSBSource} from '../../drivers/ssb';
import progressCalculation, {
  State as ProgressState,
  INITIAL_STATE as INITIAL_PROGRESS_STATE,
} from '../../components/progressCalculation';

export interface State extends ProgressState {
  selfFeedId: FeedId;
  canPublishSSB: boolean;
  selfAvatarUrl?: string;
  name?: string;
}

export default function model(ssbSource: SSBSource): Stream<Reducer<State>> {
  const selfFeedId$ = ssbSource.selfFeedId$.take(1);

  const selfFeedIdReducer$ = selfFeedId$.map(
    (selfFeedId: FeedId) =>
      function selfFeedIdReducer(prev: State): State {
        if (!prev) {
          return {
            selfFeedId,
            canPublishSSB: true,
            ...INITIAL_PROGRESS_STATE,
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
              canPublishSSB: true,
              ...INITIAL_PROGRESS_STATE,
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

  const progressReducer$ = progressCalculation(ssbSource) as Stream<
    Reducer<State>
  >;

  return xs.merge(selfFeedIdReducer$, aboutReducer$, progressReducer$);
}
