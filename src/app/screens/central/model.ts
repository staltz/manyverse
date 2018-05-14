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
import {Reducer, Lens} from 'cycle-onionify';
import {FeedId} from 'ssb-typescript';
import {Actions} from './intent';
import {State as PublicTabState} from './public-tab/model';

export type State = {
  selfFeedId: FeedId;
  visible: boolean;
  publicTab?: PublicTabState;
  numOfPublicUpdates: number;
};

export function initState(selfFeedId: FeedId): State {
  return {
    selfFeedId,
    visible: true,
    numOfPublicUpdates: 0,
  };
}

export const publicTabLens: Lens<State, PublicTabState> = {
  get: (parent: State): PublicTabState => {
    if (parent.publicTab) {
      return {...parent.publicTab, selfFeedId: parent.selfFeedId};
    } else {
      return {
        selfFeedId: parent.selfFeedId,
        getPublicFeedReadable: null,
        getSelfRootsReadable: null,
        numOfUpdates: parent.numOfPublicUpdates,
      };
    }
  },

  set: (parent: State, child: PublicTabState): State => {
    return {
      ...parent,
      numOfPublicUpdates: child.numOfUpdates,
      publicTab: child,
    };
  },
};

export default function model(actions: Actions): Stream<Reducer<State>> {
  const setVisibleReducer$ = actions.willAppear$.mapTo(
    function setVisibleReducer(prev?: State): State {
      if (!prev) {
        return {selfFeedId: '', visible: true, numOfPublicUpdates: 0};
      } else if (prev.visible) {
        return prev;
      } else {
        return {...prev, visible: true};
      }
    },
  );

  const setInvisibleReducer$ = actions.willDisappear$.mapTo(
    function setInvisibleReducer(prev?: State): State {
      if (!prev) {
        return {selfFeedId: '', visible: false, numOfPublicUpdates: 0};
      } else if (!prev.visible) {
        return prev;
      } else {
        return {...prev, visible: false};
      }
    },
  );

  return xs.merge(setVisibleReducer$, setInvisibleReducer$);
}
