// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {Platform} from 'react-native';
import path = require('path');
import {FSSource} from '../../drivers/fs';
import {OrientationEvent} from '../../drivers/orientation';
import {WindowSize} from '../../drivers/window-size';

export interface State {
  index: number;
  isPortraitMode: boolean;
  readyToStart: boolean;
  sharedSSBAccountExists: boolean;
}

interface Actions {
  pageChanged$: Stream<number>;
  skipOrNot$: Stream<boolean>;
}

export default function model(
  actions: Actions,
  orientation$: Stream<OrientationEvent>,
  windowSize$: Stream<WindowSize>,
  fsSource: FSSource,
) {
  const initReducer$ = xs.of(function initReducer(): State {
    return {
      index: 0,
      isPortraitMode: true,
      readyToStart: false,
      sharedSSBAccountExists: false,
    };
  });

  let detectSharedSSBAccountReducer$: Stream<Reducer<State>>;
  if (Platform.OS === 'web') {
    const sharedFlumeLogPath = path.join(
      process.env.SHARED_SSB_DIR!,
      'flume',
      'log.offset',
    );
    detectSharedSSBAccountReducer$ = fsSource
      .exists(sharedFlumeLogPath)
      .map((sharedFlumeLogExists) => {
        if (sharedFlumeLogExists) {
          return fsSource
            .stat(sharedFlumeLogPath)
            .map((stat: any) => stat.size as number)
            .map((size) => size >= 10);
        } else {
          return xs.of(false);
        }
      })
      .flatten()
      .map(
        (sharedSSBAccountExists) =>
          function detectSharedSSBAccountReducer(prev: State): State {
            return {...prev, sharedSSBAccountExists};
          },
      );
  } else {
    detectSharedSSBAccountReducer$ = xs.never();
  }

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
    detectSharedSSBAccountReducer$,
    setReadyReducer$,
    updateIndexReducer$,
  );
}
