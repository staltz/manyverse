// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ContactContent, FeedId, Msg, PostContent} from 'ssb-typescript';
const Ref = require('ssb-ref');
const idToUrl = require('ssb-serve-blobs/id-to-url');
const urlToId = require('ssb-serve-blobs/url-to-id');
import {portMappings} from '~frontend/drivers/ssb/ports';
import {ContactEvent} from '../types';

export function displayName(name: string | undefined, id: FeedId): string {
  if (!name) return shortFeedId(id);
  else return name;
}

function shortFeedId(feedId: FeedId | undefined): string {
  if (!feedId) return '?';
  return feedId.slice(0, 11) + '\u2026';
}

export function blobIdToUrl(blobId: string): string {
  return idToUrl(blobId, {
    port: portMappings.get('ssb-serve-blobs'),
  });
}

export function urlToBlobId(url: string) {
  return urlToId(url, {
    port: portMappings.get('ssb-serve-blobs'),
  });
}

export function getPostText(msg: Msg<PostContent>): string {
  let text = '';
  if (msg.value.content && typeof msg.value.content.text === 'string') {
    text = msg.value.content.text;
  }
  if (msg.value.content.channel) {
    text = `#${msg.value.content.channel}` + '\n\n' + text;
  }
  return text;
}

const THUMBS_UP_UNICODE = '\ud83d\udc4d';
const DIG_UNICODE = '\u270c\ufe0f';
const HEART_UNICODE = '\u2764\ufe0f';

export function voteExpressionToReaction(expression: string) {
  const lowCase = expression.toLowerCase();
  if (lowCase === 'like') return THUMBS_UP_UNICODE;
  if (lowCase === 'yup') return THUMBS_UP_UNICODE;
  if (lowCase === 'heart') return HEART_UNICODE;
  if (lowCase === 'dig') return DIG_UNICODE;
  if (expression.codePointAt(0) === 0x270c) return DIG_UNICODE;
  if (expression) return expression;
  return THUMBS_UP_UNICODE;
}

export function inferContactEvent(
  msg: Msg<ContactContent>,
): ContactEvent | null {
  const content = msg.value.content;
  // we're not sure what .flagged means
  const msgBlocking = (content as any).flagged || content.blocking;
  const msgFollowing = content.following;

  // The contact msg is nonstandard or invalid
  if (
    (msgBlocking === undefined && msgFollowing === undefined) ||
    (msgBlocking === true && msgFollowing === true) ||
    !Ref.isFeedId(content.contact)
  ) {
    return null;
  }

  return msgFollowing === true
    ? 'followed'
    : msgBlocking === undefined && msgFollowing === false
    ? 'unfollowed'
    : msgBlocking === true
    ? 'blocked'
    : 'unblocked';
}
