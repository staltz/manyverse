// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {FeedId, Msg, PostContent} from 'ssb-typescript';
const blobIdToUrl = require('ssb-serve-blobs/id-to-url');

export function displayName(name: string | undefined, id: FeedId): string {
  if (!name) return shortFeedId(id);
  else return name;
}

function shortFeedId(feedId: FeedId | undefined): string {
  if (!feedId) return '?';
  return feedId.slice(0, 11) + '\u2026';
}

export function imageToImageUrl(image: string | undefined) {
  if (!image) return undefined;
  else return blobIdToUrl(image) as string;
}

export function getPostText(msg: Msg<PostContent>): string {
  let text = msg.value.content?.text ?? '';
  if (msg.value.content.channel) {
    text = `#${msg.value.content.channel}` + '\n\n' + text;
  }
  return text;
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
