/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Listener} from 'xstream';
import {PeerMetadata} from 'ssb-typescript';
const nest = require('depnest');
const pull = require('pull-stream');

const gossipOpinion = {
  needs: nest({
    'sbot.async.gossipPeers': 'first',
    'sbot.pull.gossipChanges': 'first',
  }),
  gives: nest('sbot.obs.connectedPeers'),
  create: (api: any) => {
    const stream = xs.create<Map<string, PeerMetadata>>({
      start(listener: Listener<Map<string, PeerMetadata>>) {
        const map = (this.map = new Map<string, PeerMetadata>());
        api.sbot.async.gossipPeers((err: any, peers: Array<PeerMetadata>) => {
          if (err) return console.error(err);
          peers.filter(p => p.state === 'connected').forEach(p => {
            map.set(p.key, p);
          });
          listener.next(map);
        });

        pull(
          api.sbot.pull.gossipChanges(),
          (this.sink = pull.drain((data: any) => {
            if (data.peer) {
              if (data.type === 'remove') {
                map.delete(data.peer.key);
                listener.next(map);
              } else {
                if (data.peer.state === 'connected') {
                  map.set(data.peer.key, data.peer);
                  listener.next(map);
                } else {
                  map.delete(data.peer.key);
                  listener.next(map);
                }
              }
            }
          })),
        );
      },
      stop() {
        if (this.sink) this.sink.abort(true);
        if (this.map) (this.map as Map<any, any>).clear();
      },
    });

    return {
      sbot: {
        obs: {
          connectedPeers: () => stream,
        },
      },
    };
  },
};

export default gossipOpinion;
