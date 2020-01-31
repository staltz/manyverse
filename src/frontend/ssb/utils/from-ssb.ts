/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Msg, FeedId} from 'ssb-typescript';
const blobIdToUrl = require('ssb-serve-blobs/id-to-url');
const Ref = require('ssb-ref');

export function authorName(name: string | null, msg: Msg): string {
  return name ?? shortFeedId(msg.value.author);
}

export function shortFeedId(feedId: FeedId): string {
  return feedId.slice(0, 11) + '\u2026';
}

export function getRecipient(
  recp: string | Record<string, any>,
): string | undefined {
  if (typeof recp === 'object' && Ref.isFeed(recp.link)) {
    return recp.link;
  }
  if (typeof recp === 'string' && Ref.isFeed(recp)) {
    return recp;
  }
}

export function imageToImageUrl(val: any) {
  let image: string | null = val;
  if (!!val && typeof val === 'object' && val.link) image = val.link;
  const imageUrl: string | undefined = image ? blobIdToUrl(image) : undefined;
  return imageUrl;
}
