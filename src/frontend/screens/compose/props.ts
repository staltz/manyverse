// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId, MsgId} from 'ssb-typescript';

export interface Props {
  text?: string;
  authors?: Array<FeedId>;
  root?: MsgId;
  fork?: MsgId;
  branch?: MsgId;
  selfAvatarUrl?: string;
  selfFeedId: FeedId;
}
