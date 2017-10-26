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

const nest = require('depnest');
const {watch, Set: MutantSet} = require('mutant');
const pull = require('pull-stream');
import {PeerMetadata} from '../types';

const gossipOpinion = {
  gives: nest('sbot.obs.connectedPeers'),
  needs: nest('sbot.obs.connection', 'first'),
  create: (api: any) => {
    const connectedPeers = MutantSet();
    watch(api.sbot.obs.connection, (sbot: any) => {
      if (sbot) {
        sbot.gossip.peers((err: any, peers: Array<PeerMetadata>) => {
          if (err) return console.error(err);
          connectedPeers.set(peers.filter(x => x.state === 'connected'));
        });
        pull(
          sbot.gossip.changes(),
          pull.drain((data: any) => {
            if (data.peer) {
              if (data.type === 'remove') {
                connectedPeers.delete(data.peer.key);
              } else {
                if (data.peer.source === 'local') {
                }
                if (data.peer.state === 'connected') {
                  connectedPeers.add(data.peer.key);
                } else {
                  connectedPeers.delete(data.peer.key);
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
          connectedPeers: () => connectedPeers,
        },
      },
    };
  },
};

export default gossipOpinion;
