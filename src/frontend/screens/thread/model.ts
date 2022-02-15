// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import concat from 'xstream/extra/concat';
import flattenConcurrentlyAtMost from 'xstream/extra/flattenConcurrentlyAtMost';
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
  preferredReactions: Array<string> | null;
  expandRootCW: boolean;
  replyText: string;
  replyTextOverride: string;
  replyTextOverrideTimestamp: number;
  replyEditable: boolean;
  getSelfRepliesReadable: GetReadable<MsgAndExtras> | null;
  focusTimestamp: number;
  startAtBottom: boolean;
  initialScrollTo: MsgId | undefined;
  initialScrollToBottom: boolean | undefined;
  keyboardVisible: boolean;
}

export interface Actions {
  publishMsg$: Stream<any>;
  willReply$: Stream<any>;
  loadReplyDraft$: Stream<MsgId>;
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

function getScrollToIndex(
  scrollTo: MsgId | undefined,
  scrollToBottom: boolean | undefined,
  thread: ThreadAndExtras,
): number | undefined {
  if (!scrollTo) return undefined;
  if (scrollToBottom) return undefined;
  const index = thread.messages.findIndex((msg) => msg.key === scrollTo);
  if (index < 0) return undefined;
  return index;
}

function getStartAtBottom(
  loading: boolean,
  thread: ThreadAndExtras,
  scrollToBottom: boolean | undefined,
  scrollTo: MsgId | undefined,
): boolean {
  const scrollToIndex = getScrollToIndex(scrollTo, scrollToBottom, thread);

  const scrollToMention =
    typeof scrollToIndex === 'number' &&
    !loading &&
    thread.full &&
    scrollToIndex >= thread.messages.length - 2;

  return scrollToBottom || scrollToMention;
}

export default function model(
  props$: Stream<Props>,
  actions: Actions,
  asyncStorageSource: AsyncStorageSource,
  ssbSource: SSBSource,
  state$: Stream<State>,
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
          preferredReactions: null,
          expandRootCW: props.expandRootCW ?? false,
          replyText: '',
          replyTextOverride: '',
          replyTextOverrideTimestamp: 0,
          replyEditable: true,
          getSelfRepliesReadable: null,
          initialScrollTo: props.scrollTo,
          initialScrollToBottom: props.scrollToBottom,
          startAtBottom: getStartAtBottom(
            false,
            emptyThread,
            props.scrollToBottom,
            props.scrollTo,
          ),
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
            const thread = {full: false, messages: [rootMsg]};
            return {
              ...prev,
              thread,
              startAtBottom: getStartAtBottom(
                prev.loading,
                thread,
                prev.startAtBottom,
                prev.initialScrollTo,
              ),
            };
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
          return {
            ...prev,
            thread,
            loading: false,
            loadingReplies: false,
            startAtBottom: getStartAtBottom(
              false,
              thread,
              prev.initialScrollToBottom,
              prev.initialScrollTo,
            ),
          };
        },
    );

  const loadSubthreadReducer$ = state$
    .filter((state) => !state.loading && state.thread.full)
    .take(1)
    .map((state) => {
      const repliesToLoad = state.thread.messages
        .slice(1) // exclude the root because it's not a reply
        .map((msg) => msg.key);
      if (state.startAtBottom) repliesToLoad.reverse();
      return xs.fromArray(repliesToLoad);
    })
    .flatten()
    .map((replyMsgId) => {
      return ssbSource
        .thread$(replyMsgId, false)
        .replaceError((_err) => xs.of(emptyThread))
        .map(
          (subthread) =>
            function setSubthreadReducer(prev: State): State {
              if (prev.subthreads[replyMsgId]) {
                return prev;
              } else {
                return {
                  ...prev,
                  subthreads: {
                    ...prev.subthreads,
                    [replyMsgId]: subthread,
                  },
                };
              }
            },
        )
        .take(1);
    })
    .compose(flattenConcurrentlyAtMost(3));

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

  const loadNewSubthreadReducer$ = ssbSource.selfRepliesLive$
    .map((newMsg) =>
      ssbSource
        .thread$(newMsg.key, false)
        .replaceError((_err) => xs.of(emptyThread))
        .map(
          (subthread) =>
            function setSubthreadReducer(prev: State): State {
              if (prev.subthreads[newMsg.key]) {
                return prev;
              } else {
                return {
                  ...prev,
                  subthreads: {
                    ...prev.subthreads,
                    [newMsg.key]: subthread,
                  },
                };
              }
            },
        )
        .take(1),
    )
    .compose(flattenConcurrentlyAtMost(1));

  return concat(
    propsReducer$,
    xs.merge(
      setRootMsgReducer$,
      setThreadReducer$,
      loadSubthreadReducer$,
      updatePreferredReactionsReducer$,
      keyboardAppearedReducer$,
      keyboardDisappearedReducer$,
      updateReplyTextReducer$,
      publishReplyReducers$,
      emptyReplyTextReducer$,
      loadReplyDraftReducer$,
      addSelfRepliesReducer$,
      loadNewSubthreadReducer$,
    ),
  );
}
