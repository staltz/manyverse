/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
) {
  const content: AboutContent = {
    type: 'about',
    about: id,
  };
  if (name) content.name = name;
  if (description) content.description = description;
  return content;
}
