/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Msg, Content, FeedId, About} from 'ssb-typescript';
import {Stream} from 'xstream';

export type MsgAndExtras<C = Content> = Msg<C> & {
  value: {
    _$manyverse$metadata: {
      likes?: Stream<Array<FeedId>>;
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

export type ThreadAndExtras = {
  messages: Array<MsgAndExtras>;
  full: boolean;
  errorReason?: 'blocked' | 'missing' | 'unknown';
};

export type PrivateThreadAndExtras = ThreadAndExtras & {
  recps: Array<{
    id: string;
    name?: string;
    imageUrl: string | null | undefined;
  }>;
};

export type AnyThread = ThreadAndExtras | PrivateThreadAndExtras;

export type AboutAndExtras = About & {
  id: FeedId;
  followsYou?: boolean;
};
