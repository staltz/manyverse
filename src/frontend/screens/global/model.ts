/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {FeedId} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
};

export default function model(ssbSource: SSBSource) {
  const initReducer$ = xs.of(function initReducer(prev?: State): State {
    if (prev) {
      return prev;
    } else {
      return {selfFeedId: ''};
    }
  });

  const setSelfFeedId$ = ssbSource.selfFeedId$.map(
    selfFeedId =>
      function setSelfFeedId(prev: State): State {
        return {...prev, selfFeedId};
      },
  );

  return xs.merge(initReducer$, setSelfFeedId$);
}
