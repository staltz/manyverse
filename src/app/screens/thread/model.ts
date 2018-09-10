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
import xsFromPullStream from 'xstream-from-pull-stream';
import {Reducer} from 'cycle-onionify';
import {FeedId, MsgId} from 'ssb-typescript';
import {
  ThreadAndExtras,
  SSBSource,
  GetReadable,
  MsgAndExtras,
} from '../../drivers/ssb';

export type Props = {
  selfFeedId: FeedId;
  rootMsgId: MsgId;
  replyToMsgId: MsgId;
};

export type State = {
  selfFeedId: FeedId;
  rootMsgId: MsgId | null;
  avatarUrl?: string;
  thread: ThreadAndExtras;
  replyText: string;
  replyEditable: boolean;
  getSelfRepliesReadable: GetReadable<MsgAndExtras> | null;
  startedAsReply: boolean;
  keyboardVisible: boolean;
};

export type Actions = {
  publishMsg$: Stream<any>;
  willReply$: Stream<any>;
  keyboardAppeared$: Stream<any>;
  keyboardDisappeared$: Stream<any>;
  updateReplyText$: Stream<string>;
};

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    props =>
      function propsReducer(prev?: State): State {
        return {
          selfFeedId: props.selfFeedId,
          thread: {full: true, messages: []},
          rootMsgId: props.rootMsgId || null,
          replyText: '',
          replyEditable: true,
          getSelfRepliesReadable: null,
          startedAsReply: props.replyToMsgId ? true : false,
          keyboardVisible: props.replyToMsgId ? true : false,
        };
      },
  );

  const setThreadReducer$ = props$
    .take(1)
    .map(props => ssbSource.thread$(props.rootMsgId))
    .flatten()
    .map(
      thread =>
        function setThreadReducer(prev: State): State {
          return {...prev, thread};
        },
    );

  const keyboardAppearedReducer$ = actions.keyboardAppeared$.mapTo(
    function keyboardAppearedReducer(prev: State): State {
      return {...prev, keyboardVisible: true};
    },
  );

  const keyboardDisappearedReducer$ = actions.keyboardDisappeared$.mapTo(
    function keyboardDisappearedReducer(prev: State): State {
      return {...prev, keyboardVisible: false};
    },
  );

  const updateReplyTextReducer$ = actions.updateReplyText$.map(
    text =>
      function updateReplyTextReducer(prev: State): State {
        return {...prev, replyText: text};
      },
  );

  const publishReplyReducers$ = actions.publishMsg$
    .map(() =>
      xs.of(
        function emptyPublishedReducer(prev: State): State {
          return {...prev, replyText: '', replyEditable: false};
        },
        function resetEditableReducer(prev: State): State {
          return {...prev, replyEditable: true};
        },
      ),
    )
    .flatten();

  const aboutReducer$ = ssbSource.selfFeedId$
    .take(1)
    .map(selfFeedId => ssbSource.profileAbout$(selfFeedId))
    .flatten()
    .map(
      about =>
        function aboutReducer(prev: State): State {
          return {...prev, avatarUrl: about.imageUrl};
        },
    );

  const addSelfRepliesReducer$ = actions.willReply$
    .map(() =>
      ssbSource.selfReplies$
        .map(getReadable =>
          xsFromPullStream<MsgAndExtras>(
            getReadable({live: true, old: false}),
          ).take(1),
        )
        .flatten(),
    )
    .flatten()
    .map(
      newMsg =>
        function addSelfRepliesReducer(prev: State): State {
          return {
            ...prev,
            thread: {
              messages: prev.thread.messages.concat([newMsg]),
              full: true,
            },
          };
        },
    );

  return xs.merge(
    propsReducer$,
    setThreadReducer$,
    keyboardAppearedReducer$,
    keyboardDisappearedReducer$,
    updateReplyTextReducer$,
    publishReplyReducers$,
    aboutReducer$,
    addSelfRepliesReducer$,
  );
}
