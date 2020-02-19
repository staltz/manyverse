/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {SSBSource} from '../../drivers/ssb';
import {PrivateThreadAndExtras} from '../../../shared-types';
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

function dropCompletion(stream: Stream<any>): Stream<any> {
  return xs.merge(stream, xs.never());
}

export type State = {
  selfFeedId: FeedId;
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
    props =>
      function propsReducer(_prev?: State): State {
        if (props.rootMsgId) {
          return {
            selfFeedId: props.selfFeedId,
            rootMsgId: props.rootMsgId ?? null,
            emptyThreadSysMessage: false,
            thread: emptyThread,
          };
        } else if (props.recps) {
          return {
            selfFeedId: props.selfFeedId,
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

  const rootMsgId$ = xs
    .merge(
      // Load an existing private thread
      props$
        .take(1)
        .map(props => props.rootMsgId)
        .filter(rootMsgId => !!rootMsgId),

      // Wait for self to publish a new private thread root
      props$
        .map(props => props.recps)
        .filter(recps => !!recps)
        .take(1)
        .map(() => ssbSource.selfPrivateRoots$)
        .flatten()
        .map(msg => msg.key)
        .take(1),
    )
    .compose(dropCompletion)
    .remember() as Stream<MsgId>;

  const loadExistingThreadReducer$ = rootMsgId$
    .map(rootMsgId =>
      ssbSource.thread$(rootMsgId, true).replaceError(err => {
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
    .map(rootMsgId => ssbSource.threadUpdates$(rootMsgId, true))
    .flatten()
    .map(
      newMsg =>
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
    aboutReducer$,
    updateWithLiveRepliesReducer$,
  );
}
