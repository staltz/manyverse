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
