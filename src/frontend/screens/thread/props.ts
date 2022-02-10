// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId, MsgId} from 'ssb-typescript';
import {MsgAndExtras} from '~frontend/ssb/types';

type Basics = {
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  selfAvatarUrl?: string;
  higherRootMsgId?: MsgId;
  replyToMsgId?: MsgId;
  scrollTo?: MsgId;
  expandRootCW?: boolean;
};

export type Props =
  | (Basics & {rootMsgId: MsgId; rootMsg?: never})
  | (Basics & {rootMsg: MsgAndExtras; rootMsgId?: never});
