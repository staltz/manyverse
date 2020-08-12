/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {MsgId, FeedId} from 'ssb-typescript';
import {PrivateThreadAndExtras} from '../../ssb/types';

export type Props = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  rootMsgId?: MsgId;
  recps?: PrivateThreadAndExtras['recps'];
  goBackActionType?: string;
};
