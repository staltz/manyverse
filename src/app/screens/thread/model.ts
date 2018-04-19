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

import {Stream} from 'xstream';
import dropRepeats from 'xstream/extra/dropRepeats';
import {Reducer} from 'cycle-onionify';
import {FeedId, MsgId} from 'ssb-typescript';
import {ThreadAndExtras, SSBSource} from '../../drivers/ssb';
import sampleCombine from 'xstream/extra/sampleCombine';

export type State = {
  selfFeedId: FeedId;
  rootMsgId: MsgId | null;
  thread: ThreadAndExtras;
};

export function initState(selfFeedId: FeedId): State {
  return {
    selfFeedId,
    thread: {full: true, messages: []},
    rootMsgId: null,
  };
}

export function updateRootMsgId(prev: State, rootMsgId: MsgId): State {
  if (rootMsgId === prev.rootMsgId) {
    return prev;
  } else {
    return {
      ...prev,
      rootMsgId,
      thread: {full: true, messages: []},
    };
  }
}

export type AppearingActions = {
  appear$: Stream<null>;
  disappear$: Stream<null>;
};

export default function model(
  state$: Stream<State>,
  actions: AppearingActions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const rootIdChanged$ = state$
    .map(state => state.rootMsgId)
    .compose(dropRepeats())
    .filter(id => id !== null) as Stream<MsgId>;

  const thread$ = actions.appear$
    .compose(sampleCombine(rootIdChanged$))
    .map(([_, id]) => ssbSource.thread$(id))
    .flatten();

  const setThreadReducer$ = thread$.map(
    thread =>
      function setThreadReducer(prev: State): State {
        return {...prev, thread};
      },
  );

  return setThreadReducer$;
}
