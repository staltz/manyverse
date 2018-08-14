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

import xs, {Stream} from 'xstream';
import {PeerMetadata, FeedId} from 'ssb-typescript';
import {Reducer} from 'cycle-onionify';
import {SSBSource} from '../../../drivers/ssb';
import {WifiSource} from '../../../drivers/wifi';

export type State = {
  selfFeedId: FeedId;
  lanEnabled: boolean;
  peers: {
    lan: Array<PeerMetadata>;
    pub: Array<PeerMetadata>;
  };
};

export default function model(
  ssbSource: SSBSource,
  wifiSource: WifiSource,
): Stream<Reducer<State>> {
  const initReducer$ = xs.of(function initReducer(): State {
    return {
      selfFeedId: '',
      lanEnabled: false,
      peers: {
        lan: [],
        pub: [],
      },
    };
  });

  const updateLanEnabled$ = wifiSource.isEnabled().map(
    lanEnabled =>
      function updateLanEnabled(prev: State): State {
        return {
          selfFeedId: prev.selfFeedId,
          lanEnabled,
          peers: prev.peers,
        };
      },
  );

  const setPeersReducer$ = ssbSource.peers$.map(
    peers =>
      function setPeersReducer(prev: State): State {
        const lan = peers.filter(peer => peer.source === 'local');
        const pub = peers.filter(peer => peer.source !== 'local');
        return {
          selfFeedId: prev.selfFeedId,
          lanEnabled: prev.lanEnabled,
          peers: {lan, pub},
        };
      },
  );

  return xs.merge(initReducer$, setPeersReducer$, updateLanEnabled$);
}
