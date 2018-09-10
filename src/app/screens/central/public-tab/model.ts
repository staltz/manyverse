/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import xs, {Stream} from 'xstream';
import {Reducer} from 'cycle-onionify';
import {FeedId} from 'ssb-typescript';
import {SSBSource, GetReadable, ThreadAndExtras} from '../../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
  getPublicFeedReadable: GetReadable<ThreadAndExtras> | null;
  getSelfRootsReadable: GetReadable<ThreadAndExtras> | null;
  numOfUpdates: number;
};

export type Actions = {
  resetUpdates$: Stream<any>;
};

export default function model(
  prevState$: Stream<State>,
  actions: Actions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const setPublicFeedReducer$ = ssbSource.publicFeed$.map(
    getReadable =>
      function setPublicFeedReducer(prev: State): State {
        return {...prev, getPublicFeedReadable: getReadable};
      },
  );

  const incUpdatesReducer$ = prevState$
    .filter(s => s.numOfUpdates === 0)
    .map(() =>
      ssbSource.publicLiveUpdates$
        .take(1)
        .mapTo(function incUpdatesReducer(prev: State): State {
          return {...prev, numOfUpdates: prev.numOfUpdates + 1};
        }),
    )
    .flatten();

  const resetUpdatesReducer$ = actions.resetUpdates$.mapTo(
    function resetUpdatesReducer(prev: State): State {
      return {...prev, numOfUpdates: 0};
    },
  );

  const setSelfRootsReducer$ = ssbSource.selfRoots$.map(
    getReadable =>
      function setSelfRootsReducer(prev: State): State {
        return {...prev, getSelfRootsReadable: getReadable};
      },
  );

  return xs.merge(
    setPublicFeedReducer$,
    setSelfRootsReducer$,
    incUpdatesReducer$,
    resetUpdatesReducer$,
  );
}
