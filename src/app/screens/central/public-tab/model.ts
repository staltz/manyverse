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

import xs, {Stream, Listener} from 'xstream';
import {Reducer} from 'cycle-onionify';
import {FeedId, Msg} from '../../../../ssb/types';
import {Readable} from '../../../../typings/pull-stream';
import {SSBSource, GetReadable, ThreadAndExtras} from '../../../drivers/ssb';

export type State = {
  selfFeedId: FeedId;
  getFeedReadable: GetReadable<ThreadAndExtras> | null;
};

export default function model(ssbSource: SSBSource): Stream<Reducer<State>> {
  const setFeedPullStreamReducer$ = ssbSource.publicFeed$.map(
    getFeedReadable =>
      function setFeedPullStreamReducer(prev?: State): State {
        if (!prev) {
          throw new Error(
            'Central/PublicTab/model reducer expects existing state',
          );
        }
        return {...prev, getFeedReadable};
      },
  );

  return setFeedPullStreamReducer$;
}
