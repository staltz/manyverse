// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {
  VoteContent,
  PostContent,
  Privatable,
  FeedId,
  AboutContent,
  AttendeeContent,
  MsgId,
} from 'ssb-typescript';
const Mentions = require('remark-ssb-mentions');
import {
  PressAddReactionEvent,
  ContactContentAndExtras,
  ChannelSubscribeContent,
} from '../types';

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

type ContactOpts =
  | {following: boolean; blocking?: never; name?: string; blurhash?: string}
  | {following?: never; blocking: boolean; name?: string; blurhash?: string};

export function toContactContent(
  contact: FeedId,
  {following, blocking, name, blurhash}: ContactOpts,
): Privatable<ContactContentAndExtras> {
  const output: ContactContentAndExtras = {
    type: 'contact',
    contact,
  };

  if (typeof following === 'boolean' && typeof blocking === 'boolean') {
    throw new Error('Cannot have both following and blocking');
  }

  if (typeof following === 'boolean') {
    output.following = following;
  } else if (typeof blocking === 'boolean') {
    output.blocking = blocking;
    if (name || blurhash) {
      output.about = {};
      if (name) output.about.name = name;
      if (blurhash) output.about.blurhash = blurhash;
    }
  } else {
    throw new Error('Invalid contact options');
  }

  return output;
}

export function toGatheringAttendContent(
  gatheringId: string,
  attendeeId: string,
  isAttending: boolean,
): Privatable<AttendeeContent> {
  const attendee = isAttending
    ? {link: attendeeId}
    : {link: attendeeId, remove: true as const};
  return {
    type: 'about',
    about: gatheringId,
    attendee,
  };
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

export function toChannelSubscribeContent(
  channel: string,
  subscribed: boolean,
): ChannelSubscribeContent {
  return {
    type: 'channel',
    // The 'channel' field cannot be prefixed with '#'
    channel: channel.startsWith('#') ? channel.slice(1) : channel,
    subscribed,
  };
}
