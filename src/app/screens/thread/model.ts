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
import dropRepeats from 'xstream/extra/dropRepeats';
import {Reducer} from 'cycle-onionify';
import {FeedId, MsgId} from 'ssb-typescript';
import {ThreadAndExtras, SSBSource} from '../../drivers/ssb';
import sampleCombine from 'xstream/extra/sampleCombine';

export type State = {
  selfFeedId: FeedId;
  rootMsgId: MsgId | null;
  thread: ThreadAndExtras;
  replyText: string;
  replyEditable: boolean;
};

export function initState(selfFeedId: FeedId): State {
  return {
    selfFeedId,
    thread: {full: true, messages: []},
    rootMsgId: null,
    replyText: '',
    replyEditable: true,
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
  publishMsg$: Stream<any>;
  appear$: Stream<null>;
  disappear$: Stream<null>;
  updateReplyText$: Stream<string>;
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

  const updateReplyTextReducer$ = actions.updateReplyText$.map(
    text =>
      function updateReplyTextReducer(prev?: State): State {
        if (!prev) {
          throw new Error('Thread/model reducer expects existing state');
        }
        return {...prev, replyText: text};
      },
  );

  const setThreadReducer$ = thread$.map(
    thread =>
      function setThreadReducer(prev: State): State {
        return {...prev, thread};
      },
  );

  const publishReplyReducers$ = actions.publishMsg$
    .map(() =>
      xs.of(
        function emptyPublishedReducer(prev?: State): State {
          if (!prev) {
            throw new Error('Thread/model reducer expects existing state');
          }
          return {...prev, replyText: '', replyEditable: false};
        },
        function resetEditableReducer(prev: State): State {
          return {...prev, replyEditable: true};
        },
      ),
    )
    .flatten();

  const clearReplyReducer$ = actions.disappear$.mapTo(
    function clearReplyReducer(prev?: State): State {
      if (!prev) {
        throw new Error('Thread/model reducer expects existing state');
      }
      return {...prev, replyText: ''};
    },
  );

  return xs.merge(
    setThreadReducer$,
    updateReplyTextReducer$,
    publishReplyReducers$,
    clearReplyReducer$,
  );
}
