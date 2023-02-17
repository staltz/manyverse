// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {NativeModules, Platform} from 'react-native';
import path = require('path');
import {FSSource} from '~frontend/drivers/fs';
import {OrientationEvent} from '~frontend/drivers/orientation';
import {WindowSize} from '~frontend/drivers/window-size';

// Google Play Store has banned Manyverse once over a "policy violation
// regarding User Generated Content", and require use to have a Terms of Service
// so we're doing that only for Manyverse Android Google Play and Manyverse iOS.
export const requireEULA =
  true || // FIXME:
  (Platform.OS === 'android' &&
    NativeModules.BuildConfig.FLAVOR === 'googlePlay') ||
  Platform.OS === 'ios';

export interface State {
  index: number;
  isPortraitMode: boolean;
  readyToStart: boolean;
  sharedSSBAccountExists: boolean;
  acceptedEULA: boolean;
}

interface Actions {
  pageChanged$: Stream<number>;
  stayOnWelcome$: Stream<any>;
  acceptEULA$: Stream<boolean>;
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
      acceptedEULA: !requireEULA,
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
        const isPortraitMode =
          Platform.OS === 'web'
            ? win.height >= 540
            : ori === 'PORTRAIT' || ori === 'PORTRAIT-UPSIDEDOWN';
        return {...prev, isPortraitMode};
      },
  );

  const setReadyReducer$ = actions.stayOnWelcome$.mapTo(
    function setReadyReducer(prev: State): State {
      return {...prev, readyToStart: true};
    },
  );

  const updateIndexReducer$ = actions.pageChanged$.map(
    (newIndex: number) =>
      function updateIndexReducer(prev: State): State {
        // only go forward
        return {...prev, index: Math.max(prev.index, newIndex)};
      },
  );

  const updateAcceptEULAReducer$ = actions.acceptEULA$.map(
    (acceptedEULA) =>
      function updateAcceptEULAReducer(prev: State): State {
        return {...prev, acceptedEULA};
      },
  );

  return xs.merge(
    initReducer$,
    updatePortraitModeReducer$,
    detectSharedSSBAccountReducer$,
    setReadyReducer$,
    updateIndexReducer$,
    updateAcceptEULAReducer$,
  );
}
