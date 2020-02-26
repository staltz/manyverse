/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {isContactMsg} from 'ssb-typescript/utils';
import {FeedId, Msg} from 'ssb-typescript';
import {ClientAPI, AnyFunction} from 'react-native-ssb-client';
import manifest from '../manifest';

type Tristate = true | false | null;

type SSB = ClientAPI<
  typeof manifest & {
    hooks: {
      publishStream: AnyFunction;
    };
  }
>;

const contactPlugin = {
  name: 'contacts' as const,

  init: (ssb: SSB) => {
    const streams: Record<FeedId, Record<FeedId, Stream<Tristate>>> = {};
    function getStream(source: FeedId, dest: FeedId) {
      streams[source] = streams[source] ?? {};
      if (!streams[source][dest]) {
        streams[source][dest] = xs.createWithMemory();
        streams[source][dest].shamefullySendNext(null);
      }
      return streams[source][dest];
    }

    function updateTristateAsync(source: FeedId, dest: FeedId) {
      const stream = getStream(source, dest);
      ssb.friends.isFollowing({source, dest}, (err: any, yes: boolean) => {
        if (err) console.error(err);
        if (yes) stream.shamefullySendNext(true);
      });
      ssb.friends.isBlocking({source, dest}, (err: any, yes: boolean) => {
        if (err) console.error(err);
        if (yes) stream.shamefullySendNext(false);
      });
    }

    ssb.hooks.publishStream().addListener({
      next: (msg: Msg) => {
        if (!isContactMsg(msg)) return;
        const source = msg.value.author;
        const dest = msg.value.content.contact;
        if (!dest) return;
        const tristate = msg.value.content.following // from ssb-friends
          ? true
          : (msg.value.content as any).flagged || msg.value.content.blocking
          ? false
          : null;
        getStream(source, dest).shamefullySendNext(tristate);
      },
    });

    return {
      tristate(source: FeedId, dest: FeedId) {
        updateTristateAsync(source, dest);
        return getStream(source, dest);
      },
    };
  },
};

export default () => contactPlugin;
