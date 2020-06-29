/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {FeedId, MsgId} from 'ssb-typescript';

export type Props = {
  text?: string;
  authors?: Array<FeedId>;
  root?: MsgId;
  fork?: MsgId;
  branch?: MsgId;
  selfAvatarUrl?: string;
};
