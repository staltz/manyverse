/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {FeedId} from 'ssb-typescript';
const blobIdToUrl = require('ssb-serve-blobs/id-to-url');

export function displayName(name: string | undefined, id: FeedId): string {
  return name ?? shortFeedId(id);
}

function shortFeedId(feedId: FeedId): string {
  return feedId.slice(0, 11) + '\u2026';
}

export function imageToImageUrl(image: string | undefined) {
  if (!image) return undefined;
  else return blobIdToUrl(image) as string;
}

const THUMBS_UP_UNICODE = '\ud83d\udc4d';
const DIG_UNICODE = '\u270c\ufe0f';
const HEART_UNICODE = '\u2764\ufe0f';

export function voteExpressionToReaction(expression: string) {
  if (expression === 'Like') return THUMBS_UP_UNICODE;
  if (expression === 'like') return THUMBS_UP_UNICODE;
  if (expression === 'Yup') return THUMBS_UP_UNICODE;
  if (expression === 'heart') return HEART_UNICODE;
  if (expression === 'dig') return DIG_UNICODE;

  return expression ?? THUMBS_UP_UNICODE;
}
