/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Msg, FeedId} from 'ssb-typescript';

export function authorName(name: string | null, msg: Msg): string {
  return name || msg.value.author.slice(1, 10);
}

export function shortFeedId(feedId: FeedId): string {
  return feedId.slice(0, 11) + '\u2026';
}
