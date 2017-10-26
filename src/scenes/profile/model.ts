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
import dropRepeats from 'xstream/extra/dropRepeats';
import {SSBSource} from '../../drivers/ssb';
import {StateSource, Reducer} from 'cycle-onionify';
import {FeedId, About, Msg} from '../../ssb/types';
import {includeMsgIntoFeed} from '../../ssb/utils';

export type FeedData = {
  updated: number;
  arr: Array<Msg>;
};

export type State = {
  selfFeedId: FeedId;
  displayFeedId: FeedId;
  feed: FeedData;
  about: About;
};

export default function model(
  state$: Stream<State>,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const displayFeedIdChanged$ = state$
    .map(state => state.displayFeedId)
    .compose(dropRepeats());

  const msg$ = displayFeedIdChanged$
    .map(id => ssbSource.profileFeed$(id))
    .flatten();

  const about$ = displayFeedIdChanged$
    .map(id => ssbSource.profileAbout$(id))
    .flatten();

  const cleanUpFeedReducer$ = displayFeedIdChanged$.mapTo(
    function cleanUpFeedReducer(prevState: State): State {
      return {...prevState, feed: {updated: 0, arr: []}};
    },
  );

  const mutateFeedReducer$ = msg$.map(
    msg =>
      function mutateFeedReducer(prevState: State): State {
        includeMsgIntoFeed(prevState.feed, msg);
        return {...prevState};
      },
  );

  const updateAboutReducer$ = about$.map(
    about =>
      function updateAboutReducer(prevState: State): State {
        return {
          ...prevState,
          about,
        };
      },
  );

  const setSelfFeedIdReducer$ = ssbSource.selfFeedId$.take(1).map(
    selfFeedId =>
      function setSelfFeedIdReducer(prevState: State | undefined): State {
        if (!prevState) {
          return {
            selfFeedId,
            displayFeedId: selfFeedId,
            feed: {
              updated: 0,
              arr: [],
            },
            about: {
              name: selfFeedId,
              description: '',
              id: selfFeedId,
            },
          };
        } else {
          return {...prevState, selfFeedId};
        }
      },
  );

  return xs.merge(
    mutateFeedReducer$,
    cleanUpFeedReducer$,
    updateAboutReducer$,
    setSelfFeedIdReducer$,
  );
}
