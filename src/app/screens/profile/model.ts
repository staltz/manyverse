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
import {SSBSource, GetReadable, ThreadAndExtras} from '../../drivers/ssb';
import {StateSource, Reducer} from 'cycle-onionify';
import {FeedId, About} from 'ssb-typescript';
import {State as EditProfileState} from './edit';
import {Readable} from '../../../typings/pull-stream';
import {Lens} from 'cycle-onionify/lib/types';

export type State = {
  selfFeedId: FeedId;
  displayFeedId: FeedId;
  about: About;
  getFeedReadable: GetReadable<ThreadAndExtras> | null;
  edit?: EditProfileState;
};

export function initState(selfFeedId: FeedId): State {
  return {
    selfFeedId,
    displayFeedId: selfFeedId,
    getFeedReadable: null,
    about: {
      name: selfFeedId,
      description: '',
      id: selfFeedId,
    },
  };
}

export const editLens: Lens<State, EditProfileState> = {
  get: (parent: State): EditProfileState => {
    if (parent.edit) {
      return parent.edit;
    } else {
      return {about: parent.about};
    }
  },

  set: (parent: State, child: EditProfileState): State => {
    return {...parent, edit: child};
  },
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
    return {
      ...prev,
      selfFeedId,
      displayFeedId,
      getFeedReadable: null,
      about: {
        ...prev.about,
        name: displayFeedId,
        id: displayFeedId,
      },
    };
  } else {
    return {...prev, selfFeedId};
  }
}

export function updateDisplayFeedId(prev: State, displayFeedId: FeedId): State {
  if (displayFeedId === prev.displayFeedId) {
    return prev;
  } else {
    return {
      ...prev,
      displayFeedId,
      about: {
        name: displayFeedId,
        id: displayFeedId,
      },
      getFeedReadable: null,
    };
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

  const getFeedReadable$ = actions.appear$
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
        return {...prev, about};
      },
  );

  const updateFeedStreamReducer$ = getFeedReadable$.map(
    getFeedReadable =>
      function updateFeedStreamReducer(prev?: State): State {
        if (!prev) {
          throw new Error('Profile/model reducer expects existing state');
        }
        return {...prev, getFeedReadable};
      },
  );

  const clearFeedStreamReducer$ = actions.disappear$.mapTo(
    function clearFeedStreamReducer(prev?: State): State {
      if (!prev) {
        throw new Error('Profile/model reducer expects existing state');
      }
      return {...prev, getFeedReadable: null};
    },
  );

  return xs.merge(
    updateAboutReducer$,
    updateFeedStreamReducer$,
    clearFeedStreamReducer$,
  );
}
