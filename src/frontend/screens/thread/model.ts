// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import {Reducer} from '@cycle/state';
import {AsyncStorageSource} from 'cycle-native-asyncstorage';
import {FeedId, MsgId} from 'ssb-typescript';
import {ThreadAndExtras, MsgAndExtras} from '~frontend/ssb/types';
import {SSBSource, GetReadable} from '~frontend/drivers/ssb';
import {Props} from './props';

export interface State {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  rootMsgId: MsgId;
  higherRootMsgId: MsgId | undefined;
  loading: boolean;
  loadingReplies: boolean;
  thread: ThreadAndExtras;
  subthreads: Record<MsgId, ThreadAndExtras>;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  expandRootCW: boolean;
  replyText: string;
  replyTextOverride: string;
  replyTextOverrideTimestamp: number;
  replyEditable: boolean;
  getSelfRepliesReadable: GetReadable<MsgAndExtras> | null;
  focusTimestamp: number;
  initialScrollTo: MsgId | undefined;
  keyboardVisible: boolean;
}

export interface Actions {
  publishMsg$: Stream<any>;
  willReply$: Stream<any>;
  loadReplyDraft$: Stream<MsgId>;
  replySeen$: Stream<MsgId>;
  keyboardAppeared$: Stream<any>;
  keyboardDisappeared$: Stream<any>;
  updateReplyText$: Stream<string>;
}

const emptyThread: ThreadAndExtras = {full: true, messages: []};
const missingThread: ThreadAndExtras = {
  full: true,
  messages: [],
  errorReason: 'missing',
};
const blockedThread: ThreadAndExtras = {
  full: true,
  messages: [],
  errorReason: 'blocked',
};
const unknownErrorThread: ThreadAndExtras = {
  full: true,
  messages: [],
  errorReason: 'unknown',
};

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
): Stream<Reducer<State>> {
  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(_prev?: State): State {
        return {
          selfFeedId: props.selfFeedId,
          selfAvatarUrl: props.selfAvatarUrl,
          rootMsgId: props.rootMsgId ?? props.rootMsg.key,
          higherRootMsgId: props.higherRootMsgId,
          loading: true,
          loadingReplies: !!props.rootMsg,
          thread: emptyThread,
          subthreads: {},
          lastSessionTimestamp: props.lastSessionTimestamp,
          preferredReactions: [],
          expandRootCW: props.expandRootCW ?? false,
          replyText: '',
          replyTextOverride: '',
          replyTextOverrideTimestamp: 0,
          replyEditable: true,
          getSelfRepliesReadable: null,
          initialScrollTo: props.scrollTo,
          focusTimestamp: props.replyToMsgId ? Date.now() : 0,
          keyboardVisible: props.replyToMsgId ? true : false,
        };
      },
  );

  const setRootMsgReducer$ = props$
    .take(1)
    .map((props) =>
      props.rootMsg ? ssbSource.rehydrateMessage$(props.rootMsg) : xs.never(),
    )
    .flatten()
    .map(
      (rootMsg) =>
        function setRootMsgReducer(prev: State): State {
          if (prev.thread.full && prev.thread.messages.length > 0) {
            return prev;
          } else {
            return {...prev, thread: {full: false, messages: [rootMsg]}};
          }
        },
    );

  const setThreadReducer$ = props$
    .take(1)
    .map((props) =>
      ssbSource
        .thread$(props.rootMsgId ?? props.rootMsg.key, false)
        .replaceError((err) => {
          if (/Author Blocked/i.test(err.message)) return xs.of(blockedThread);
          if (/Not Found/i.test(err.message)) return xs.of(missingThread);
          else return xs.of(unknownErrorThread);
        }),
    )
    .flatten()
    .map(
      (thread) =>
        function setThreadReducer(prev: State): State {
          return {...prev, thread, loading: false, loadingReplies: false};
        },
    );

  const setSubthreadReducer$ = actions.replySeen$
    .map((msgId) =>
      ssbSource
        .thread$(msgId, false)
        .replaceError((_err) => xs.of(emptyThread))
        .map(
          (subthread) =>
            function setSubthreadReducer(prev: State): State {
              if (prev.subthreads[msgId]) {
                return prev;
              } else {
                return {
                  ...prev,
                  subthreads: {...prev.subthreads, [msgId]: subthread},
                };
              }
            },
        ),
    )
    .compose(flattenConcurrently);

  const updatePreferredReactionsReducer$ = ssbSource.preferredReactions$.map(
    (preferredReactions) =>
      function updatePreferredReactionsReducer(prev: State): State {
        return {...prev, preferredReactions};
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
    (text) =>
      function updateReplyTextReducer(prev: State): State {
        return {...prev, replyText: text};
      },
  );

  const publishReplyReducers$ = actions.publishMsg$
    .map(() =>
      xs.of(
        function emptyPublishedReducer(prev: State): State {
          return {
            ...prev,
            replyText: '',
            replyTextOverride: '',
            replyTextOverrideTimestamp: Date.now(),
            replyEditable: false,
          };
        },
        function resetEditableReducer(prev: State): State {
          return {...prev, replyEditable: true};
        },
      ),
    )
    .flatten();

  const emptyReplyTextReducer$ = actions.willReply$.mapTo(
    function emptyReplyTextReducer(prev: State): State {
      return {
        ...prev,
        replyText: '',
        replyTextOverride: '',
        replyTextOverrideTimestamp: Date.now(),
      };
    },
  );

  const loadReplyDraftReducer$ = actions.loadReplyDraft$
    .map((rootMsgId) => asyncStorageSource.getItem(`replyDraft:${rootMsgId}`))
    .flatten()
    .map(
      (replyText) =>
        function loadReplyDraftReducer(prev: State): State {
          if (!replyText) {
            return {
              ...prev,
              replyText: '',
              replyTextOverride: '',
              replyTextOverrideTimestamp: Date.now(),
            };
          } else {
            return {
              ...prev,
              replyText,
              replyTextOverride: replyText,
              replyTextOverrideTimestamp: Date.now(),
            };
          }
        },
    );

  const addSelfRepliesReducer$ = ssbSource.selfRepliesLive$.map(
    (newMsg) =>
      function addSelfRepliesReducer(prev: State): State {
        if (
          newMsg.value.author === prev.selfFeedId &&
          newMsg.value.content.root === prev.rootMsgId
        ) {
          return {
            ...prev,
            thread: {
              messages: prev.thread.messages.concat([newMsg]),
              full: true,
            },
          };
        } else {
          return prev;
        }
      },
  );

  return concat(
    propsReducer$,
    xs.merge(
      setRootMsgReducer$,
      setThreadReducer$,
      setSubthreadReducer$,
      updatePreferredReactionsReducer$,
      keyboardAppearedReducer$,
      keyboardDisappearedReducer$,
      updateReplyTextReducer$,
      publishReplyReducers$,
      emptyReplyTextReducer$,
      loadReplyDraftReducer$,
      addSelfRepliesReducer$,
    ),
  );
}
