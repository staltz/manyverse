/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {FeedId} from 'ssb-typescript';
import {SSBSource} from '../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
};

export default function model(ssbSource: SSBSource) {
  const aboutReducer$ = ssbSource.selfFeedId$
    .take(1)
    .map((selfFeedId) =>
      ssbSource.profileAbout$(selfFeedId).map(
        (about) =>
          function aboutReducer(prev: State): State {
            const selfAvatarUrl = about.imageUrl;
            return {...(prev ?? {}), selfFeedId, selfAvatarUrl};
          },
      ),
    )
    .flatten();

  return aboutReducer$;
}
