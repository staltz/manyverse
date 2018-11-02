/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  VoteContent,
  PostContent,
  ContactContent,
  FeedId,
  AboutContent,
  MsgId,
} from 'ssb-typescript';

export type LikeEvent = {
  msgKey: string;
  like: boolean;
};

export function toVoteContent(ev: LikeEvent): VoteContent {
  return {
    type: 'vote',
    vote: {
      link: ev.msgKey,
      value: ev.like ? 1 : 0,
      expression: ev.like ? 'Like' : 'Unlike',
    },
  };
}

export function toPostContent(text: string): PostContent {
  return {
    text,
    type: 'post',
    mentions: [],
  };
}

export function toReplyPostContent(text: string, root: MsgId): PostContent {
  return {
    text,
    type: 'post',
    root,
    mentions: [],
  };
}

export function toContactContent(
  contact: FeedId,
  following: boolean,
): ContactContent {
  return {
    type: 'contact',
    following,
    contact,
  };
}

export function toAboutContent(
  id: FeedId,
  name: string | undefined,
  description: string | undefined,
  image: string | undefined,
) {
  const content: AboutContent = {
    type: 'about',
    about: id,
  };
  if (name) content.name = name;
  if (description) content.description = description;
  if (image) content.image = image;
  return content;
}
