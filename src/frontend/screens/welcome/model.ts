/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {OrientationEvent} from '../../drivers/orientation';
import {WindowSize} from '../../drivers/window-size';

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
  windowSize$: Stream<WindowSize>,
) {
  const initReducer$ = xs.of(function initReducer(): State {
    return {index: 0, isPortraitMode: true, readyToStart: false};
  });

  const updatePortraitModeReducer$ = xs.combine(orientation$, windowSize$).map(
    ([ori, win]) =>
      function updatePortraitModeReducer(prev: State): State {
        const isPortrait = ori === 'PORTRAIT' || ori === 'PORTRAIT-UPSIDEDOWN';
        const isUltrawide = win.width / win.height > 2;
        return {...prev, isPortraitMode: isPortrait || !isUltrawide};
      },
  );

  const setReadyReducer$ = actions.skipOrNot$
    .filter((skip) => skip === false)
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
    updatePortraitModeReducer$,
    setReadyReducer$,
    updateIndexReducer$,
  );
}
