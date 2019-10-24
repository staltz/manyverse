/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {OrientationEvent} from '../../drivers/orientation';

export type State = {
  index: number;
  isPortraitMode: boolean;
  readyToStart: boolean;
};

type Actions = {
  pageChanged$: Stream<number>;
  skipOrNot$: Stream<boolean>;
};

export default function model(
  actions: Actions,
  orientation$: Stream<OrientationEvent>,
) {
  const initReducer$ = xs.of(function initReducer(): State {
    return {index: 0, isPortraitMode: true, readyToStart: false};
  });

  const updateOrientationReducer$ = orientation$.map(
    ori =>
      function updateOrientationReducer(prev: State): State {
        return {
          ...prev,
          isPortraitMode: ori === 'PORTRAIT' || ori === 'PORTRAIT-UPSIDEDOWN',
        };
      },
  );

  const setReadyReducer$ = actions.skipOrNot$
    .filter(skip => skip === false)
    .mapTo(function setReadyReducer(prev: State): State {
      return {...prev, readyToStart: true};
    });

  const updateIndexReducer$ = actions.pageChanged$.map(
    (newIndex: number) =>
      function updateIndexReducer(prev: State): State {
        // only go forward
        return {...prev, index: Math.max(prev.index, newIndex)};
      },
  );

  return xs.merge(
    initReducer$,
    updateOrientationReducer$,
    setReadyReducer$,
    updateIndexReducer$,
  );
}
