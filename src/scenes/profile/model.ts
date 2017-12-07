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
import sampleCombine from 'xstream/extra/sampleCombine';
import {SSBSource, MsgAndExtras} from '../../drivers/ssb';
import {StateSource, Reducer} from 'cycle-onionify';
import {FeedId, About} from '../../ssb/types';
import {State as EditProfileState} from './edit';
import {Readable} from '../../typings/pull-stream';

export type State = {
  selfFeedId: FeedId;
  displayFeedId: FeedId;
  about: About;
  feedReadable: Readable<MsgAndExtras> | null;
  edit: EditProfileState;
};

export type AppearingActions = {
  appear$: Stream<null>;
  disappear$: Stream<null>;
};

export function updateSelfFeedId(prev: State, selfFeedId: FeedId): State {
  if (selfFeedId === prev.selfFeedId) {
    return prev;
  } else if (prev.displayFeedId === prev.selfFeedId) {
    const displayFeedId = selfFeedId;
    const about = {
      ...prev.about,
      name: displayFeedId,
      id: displayFeedId,
    };
    return {
      ...prev,
      selfFeedId,
      displayFeedId,
      feedReadable: null,
      about,
      edit: {
        about,
      },
    };
  } else {
    return {...prev, selfFeedId};
  }
}

export default function model(
  state$: Stream<State>,
  actions: AppearingActions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const displayFeedIdChanged$ = state$
    .map(state => state.displayFeedId)
    .compose(dropRepeats());

  const feedStream$ = actions.appear$
    // TODO create custom operator 'sample' and use it instead of sampleCombine
    .compose(sampleCombine(displayFeedIdChanged$))
    .map(([_, id]) => ssbSource.profileFeed$(id))
    .flatten();

  const about$ = displayFeedIdChanged$
    .map(id => ssbSource.profileAbout$(id))
    .flatten();

  const updateAboutReducer$ = about$.map(
    about =>
      function updateAboutReducer(prev?: State): State {
        if (!prev) {
          throw new Error('Profile/model reducer expects existing state');
        }
        return {
          ...prev,
          about,
          edit: {
            ...prev.edit,
            about,
          },
        };
      },
  );

  const updateFeedStreamReducer$ = feedStream$.map(
    feedReadable =>
      function updateFeedStreamReducer(prev?: State): State {
        if (!prev) {
          throw new Error('Profile/model reducer expects existing state');
        }
        return {...prev, feedReadable};
      },
  );

  const clearFeedStreamReducer$ = actions.disappear$.mapTo(
    function clearFeedStreamReducer(prev?: State): State {
      if (!prev) {
        throw new Error('Profile/model reducer expects existing state');
      }
      return {...prev, feedReadable: null};
    },
  );

  return xs.merge(
    updateAboutReducer$,
    updateFeedStreamReducer$,
    clearFeedStreamReducer$,
  );
}
