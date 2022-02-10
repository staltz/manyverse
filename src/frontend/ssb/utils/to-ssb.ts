// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {
  VoteContent,
  PostContent,
  ContactContent,
  Privatable,
  FeedId,
  AboutContent,
  MsgId,
} from 'ssb-typescript';
const Mentions = require('remark-ssb-mentions');
import {PressAddReactionEvent} from '../types';

export function toVoteContent(
  ev: PressAddReactionEvent,
): Privatable<VoteContent> {
  return {
    type: 'vote',
    vote: {
      link: ev.msgKey,
      value: ev.value,
      expression: ev.reaction ?? 'Unlike',
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
    mentions: Mentions(text),
  };

  if (contentWarning) {
    (content as any).contentWarning = contentWarning;
  }

  return content;
}

export function toReplyPostContent({
  text,
  root,
  fork,
  branch,
  contentWarning,
}: {
  text: string;
  root: MsgId;
  fork?: MsgId;
  branch?: MsgId;
  contentWarning?: string;
}): Privatable<PostContent> {
  const content: PostContent & {contentWarning?: string; fork?: MsgId} = {
    text,
    type: 'post',
    root,
    mentions: Mentions(text),
  };
  if (branch) content.branch = branch;
  if (fork) content.fork = fork;
  if (contentWarning) content.contentWarning = contentWarning;
  return content;
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
