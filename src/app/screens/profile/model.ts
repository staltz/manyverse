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

import xs, {Stream} from 'xstream';
import {SSBSource, GetReadable, ThreadAndExtras} from '../../drivers/ssb';
import {Reducer} from 'cycle-onionify';
import {FeedId, About} from 'ssb-typescript';

export type Props = {
  selfFeedId: FeedId;
  feedId: FeedId;
};

export type State = {
  selfFeedId: FeedId;
  displayFeedId: FeedId;
  about: About & {id: FeedId};
  getFeedReadable: GetReadable<ThreadAndExtras> | null;
  getSelfRootsReadable: GetReadable<ThreadAndExtras> | null;
};

export default function model(
  props$: Stream<Props>,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.map(
    props =>
      function propsReducer(): State {
        return {
          selfFeedId: props.selfFeedId,
          displayFeedId: props.feedId,
          getFeedReadable: null,
          getSelfRootsReadable: null,
          about: {
            name: props.feedId,
            description: '',
            id: props.feedId,
          },
        };
      },
  );

  const about$ = props$
    .map(props => ssbSource.profileAbout$(props.feedId))
    .flatten();

  const updateAboutReducer$ = about$.map(
    about =>
      function updateAboutReducer(prev: State): State {
        return {...prev, about};
      },
  );

  const getFeedReadable$ = props$
    .map(props => ssbSource.profileFeed$(props.feedId))
    .flatten();

  const updateFeedStreamReducer$ = getFeedReadable$.map(
    getFeedReadable =>
      function updateFeedStreamReducer(prev: State): State {
        return {...prev, getFeedReadable};
      },
  );

  const updateSelfRootsReducer$ = ssbSource.selfRoots$.map(
    getReadable =>
      function updateSelfRootsReducer(prev: State): State {
        return {...prev, getSelfRootsReadable: getReadable};
      },
  );

  return xs.merge(
    propsReducer$,
    updateAboutReducer$,
    updateFeedStreamReducer$,
    updateSelfRootsReducer$,
  );
}
