/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  VoteContent,
  PostContent,
  ContactContent,
  Privatable,
  FeedId,
  AboutContent,
  MsgId,
} from 'ssb-typescript';

export type LikeEvent = {
  msgKey: string;
  like: boolean;
};

export function toVoteContent(ev: LikeEvent): Privatable<VoteContent> {
  return {
    type: 'vote',
    vote: {
      link: ev.msgKey,
      value: ev.like ? 1 : 0,
      expression: ev.like ? 'Like' : 'Unlike',
    },
  };
}

export function toPostContent(
  text: string,
  contentWarning?: string,
): Privatable<PostContent> {
  const content: PostContent = {
    text,
    type: 'post',
    mentions: [],
  };

  if (contentWarning) {
    (content as any).contentWarning = contentWarning;
  }

  return content;
}

export function toReplyPostContent(
  text: string,
  root: MsgId,
): Privatable<PostContent> {
  return {
    text,
    type: 'post',
    root,
    mentions: [],
  };
}

export function toContactContent(
  contact: FeedId,
  following: boolean | null,
  blocking?: boolean | undefined,
): Privatable<ContactContent> {
  const output: ContactContent = {
    type: 'contact',
    following: following as any,
    contact,
  };
  if (typeof blocking === 'boolean') {
    output.blocking = blocking;
  }
  return output;
}

export function toAboutContent(
  id: FeedId,
  name: string | undefined,
  description: string | undefined,
  image: string | undefined,
): Privatable<AboutContent> {
  const content: AboutContent = {
    type: 'about',
    about: id,
  };
  if (name) content.name = name;
  if (description) content.description = description;
  if (image) content.image = image;
  return content;
}
