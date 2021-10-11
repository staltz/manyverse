// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {SSBSource} from '../../drivers/ssb';
import {PrivateThreadAndExtras} from '../../ssb/types';
import {Props} from '.';
import {Reducer} from '@cycle/state';
import {FeedId, MsgId} from 'ssb-typescript';

const emptyThread: PrivateThreadAndExtras = {
  full: true,
  messages: [],
  recps: [],
};
const missingThread: PrivateThreadAndExtras = {
  full: true,
  messages: [],
  errorReason: 'missing',
  recps: [],
};
const blockedThread: PrivateThreadAndExtras = {
  full: true,
  messages: [],
  errorReason: 'blocked',
  recps: [],
};
const unknownErrorThread: PrivateThreadAndExtras = {
  full: true,
  messages: [],
  errorReason: 'unknown',
  recps: [],
};

function dropCompletion<T>(stream: Stream<T>): Stream<T> {
  return xs.merge(stream, xs.never());
}

export type State = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  rootMsgId: MsgId | null;
  thread: PrivateThreadAndExtras;
  emptyThreadSysMessage: boolean;
  avatarUrl?: string;
};

export default function model(
  props$: Stream<Props>,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(_prev?: State): State {
        if (props.rootMsgId) {
          return {
            selfFeedId: props.selfFeedId,
            selfAvatarUrl: props.selfAvatarUrl,
            rootMsgId: props.rootMsgId ?? null,
            emptyThreadSysMessage: false,
            thread: emptyThread,
          };
        } else if (props.recps) {
          return {
            selfFeedId: props.selfFeedId,
            selfAvatarUrl: props.selfAvatarUrl,
            rootMsgId: null,
            emptyThreadSysMessage: true,
            thread: {
              full: true,
              messages: [],
              recps: props.recps,
            },
          };
        } else {
          throw new Error('Conversation got invalid props: ' + props);
        }
      },
  );

  const rootMsgId$ = xs
    .merge(
      // Load an existing private thread
      props$.map((props) => props.rootMsgId).filter((rootMsgId) => !!rootMsgId),

      // Wait for self to publish a new private thread root
      props$
        .map((props) => props.rootMsgId)
        .filter((rootMsgId) => !rootMsgId)
        .take(1)
        .map(() => ssbSource.selfPrivateRootIdsLive$)
        .flatten(),
    )
    .take(1)
    .compose(dropCompletion)
    .remember() as Stream<MsgId>;

  const loadExistingThreadReducer$ = rootMsgId$
    .map((rootMsgId) =>
      ssbSource.thread$(rootMsgId, true).replaceError((err) => {
        if (/Author Blocked/i.test(err.message)) return xs.of(blockedThread);
        if (/Not Found/i.test(err.message)) return xs.of(missingThread);
        else return xs.of(unknownErrorThread);
      }),
    )
    .flatten()
    .map(
      (thread: PrivateThreadAndExtras) =>
        function setThreadReducer(prev: State): State {
          if (!prev.rootMsgId) {
            return {...prev, thread, rootMsgId: thread.messages[0].key};
          } else {
            return {...prev, thread};
          }
        },
    );

  const updateWithLiveRepliesReducer$ = rootMsgId$
    .map((rootMsgId) => ssbSource.threadUpdates$(rootMsgId, true))
    .flatten()
    .map(
      (newMsg) =>
        function updateWithLiveRepliesReducer(prev: State): State {
          return {
            ...prev,
            thread: {
              messages: prev.thread.messages.concat([newMsg]),
              recps: prev.thread.recps,
              full: true,
            },
          };
        },
    );

  return xs.merge(
    propsReducer$,
    loadExistingThreadReducer$,
    updateWithLiveRepliesReducer$,
  );
}
