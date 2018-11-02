/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {PeerMetadata} from 'ssb-typescript';
const nest = require('depnest');
const {watch} = require('mutant');
const pull = require('pull-stream');

const gossipOpinion = {
  gives: nest('sbot.obs.connectedPeers'),
  needs: nest('sbot.obs.connection', 'first'),
  create: (api: any) => {
    const connectedPeers = new Map<string, PeerMetadata>();
    const stream = xs.create<Map<string, PeerMetadata>>();
    watch(api.sbot.obs.connection, (sbot: any) => {
      if (sbot) {
        sbot.gossip.peers((err: any, peers: Array<PeerMetadata>) => {
          if (err) return console.error(err);
          peers.filter(p => p.state === 'connected').forEach(p => {
            connectedPeers.set(p.key, p);
          });
          stream.shamefullySendNext(connectedPeers);
        });
        pull(
          sbot.gossip.changes(),
          pull.drain((data: any) => {
            if (data.peer) {
              if (data.type === 'remove') {
                connectedPeers.delete(data.peer.key);
                stream.shamefullySendNext(connectedPeers);
              } else {
                if (data.peer.state === 'connected') {
                  connectedPeers.set(data.peer.key, data.peer);
                  stream.shamefullySendNext(connectedPeers);
                } else {
                  connectedPeers.delete(data.peer.key);
                  stream.shamefullySendNext(connectedPeers);
                }
              }
            }
          }),
        );
      }
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
