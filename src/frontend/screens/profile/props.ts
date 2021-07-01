/* Copyright (C) 2020-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {FeedId} from 'ssb-typescript';

export interface Props {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  feedId: FeedId;
  reason?: 'connection-attempt';
}
