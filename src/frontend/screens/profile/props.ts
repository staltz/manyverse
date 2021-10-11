// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId} from 'ssb-typescript';

export interface Props {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  feedId: FeedId;
  reason?: 'connection-attempt';
}
