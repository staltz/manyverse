/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Msg, Content, FeedId, About, MsgId, AliasContent} from 'ssb-typescript';
import {Stream} from 'xstream';
import {Peer as ConnQueryPeer} from 'ssb-conn-query/lib/types';

export type Reactions = Array<[FeedId, string]> | null;

export interface PressAddReactionEvent {
  msgKey: MsgId;
  value: 0 | 1;
  reaction: string | null;
}

export interface PressReactionsEvent {
  msgKey: MsgId;
  reactions: Reactions;
}

export type MsgAndExtras<C = Content> = Msg<C> & {
  value: {
    _$manyverse$metadata: {
      reactions?: Stream<NonNullable<Reactions>>;
      about: {
        name?: string;
        imageUrl: string | null;
      };
      contact?: {
        name?: string;
      };
    };
  };
};

export interface ThreadSummary<C = Content> {
  root: Msg<C>;
  replyCount: number;
}

export interface ThreadSummaryWithExtras {
  root: MsgAndExtras;
  replyCount: number;
  timestamp: number;
}

export interface ThreadAndExtras {
  messages: Array<MsgAndExtras>;
  full: boolean;
  errorReason?: 'blocked' | 'missing' | 'unknown';
}

export interface PrivateThreadAndExtras extends ThreadAndExtras {
  recps: Array<{
    id: string;
    name?: string;
    imageUrl: string | null | undefined;
  }>;
}

export type AnyThread = ThreadAndExtras | PrivateThreadAndExtras;

export interface AboutAndExtras extends About {
  id: FeedId;
  followsYou?: boolean;
}

export type PeerKV = ConnQueryPeer;

export interface StagedPeerMetadata {
  key: string;
  type: 'lan' | 'dht' | 'internet' | 'bt';
  role?: 'client' | 'server';
  note?: string;
}

export type StagedPeerKV = [string, StagedPeerMetadata];

export type Alias = Required<Omit<AliasContent, 'type' | 'action'>>;

export interface FirewallAttempt {
  id: FeedId;
  ts: number;
}
