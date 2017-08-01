/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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

export type PeerMetadata = {
  host: string;
  port: number;
  key: string;
  source: 'local' | 'pub' | 'manual';
  announcers?: number;
  duration?: any;
  client: boolean;
  state: 'connecting' | 'connected' | 'disconnecting' | undefined;
  stateChange: number;
  ping?: {
    rtt: {
      mean: number;
      stdev: number;
      count: number;
      sum: number;
      sqsum: number;
    };
    skew: {
      mean: number;
      stdev: number;
      count: number;
      sum: number;
      sqsum: number;
    };
  };
};

/**
 * Starts with @
 */
export type FeedKey = string;

/**
 * Starts with %
 */
export type MsgId = string;

/**
 * Starts with &
 */
export type BlobId = string;

export type Msg<C = Content> = {
  key: MsgId;
  value: {
    previous: MsgId;
    author: FeedKey;
    sequence: number;
    timestamp: number;
    hash: 'sha256';
    content: C;
    signature: string;
  };
  timestamp: number;
};

export function isMsg(msg: any): msg is Msg<any> {
  return msg && msg.key && msg.value && typeof msg.value === 'object';
}

export function isPostMsg(msg: Msg<any>): msg is Msg<PostContent> {
  return msg.value.content && msg.value.content.type === 'post';
}

export function isContactMsg(msg: Msg<any>): msg is Msg<ContactContent> {
  return msg.value.content && msg.value.content.type === 'contact';
}

export type Content = PostContent | ContactContent;

export type PostContent = {
  type: 'post';
  text: string;
  channel?: string;

  /**
   * Links
   */
  mentions?: Array<any>;
  // root: MsgLink;
  // branch: MsgLink | MsgLinks;
  // recps: FeedLinks;
  // mentions: Links;
};

export type ContactContent = {
  type: 'contact';

  /**
   * FeedLink
   */
  contact?: string;
  following?: boolean;
  blocking?: boolean;
};

// export type AboutContent = {
//   type: 'about';
//   about: Link;
//   name: String;
//   image: BlobLink;
// };
// { type: 'post-edit', text: String, root: MsgLink, revisionRoot: MsgLink, revisionBranch: MsgLink, mentions: Links }
// { type: 'vote', vote: { link: Ref, value: -1|0|1, reason: String } }
// { type: 'pub', pub: { link: FeedRef, host: String, port: Number  }
