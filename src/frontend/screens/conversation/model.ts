// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {Reducer} from '@cycle/state';
import {Platform} from 'react-native';
import {IMessage as GiftedMsg} from 'react-native-gifted-chat';
import {FeedId, MsgId, PostContent} from 'ssb-typescript';
import {SSBSource} from '~frontend/drivers/ssb';
import {MsgAndExtras, PrivateThreadAndExtras} from '~frontend/ssb/types';
import {t} from '~frontend/drivers/localization';
import {Props} from '.';

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

const MAX_GIFTED_MESSAGES_TO_LOAD = Platform.select({
  web: 20,
  default: 8,
});

function dropCompletion<T>(stream: Stream<T>): Stream<T> {
  return xs.merge(stream, xs.never());
}

export interface SSBGiftedMsg extends GiftedMsg {
  mentions?: Array<any>;
}

function toGiftedMessage(msg: MsgAndExtras<PostContent>): SSBGiftedMsg {
  return {
    _id: msg.key,
    createdAt: msg.value.timestamp,
    text: msg.value.content.text,
    mentions: msg.value.content.mentions,
    user: {
      _id: msg.value.author,
      name: msg.value._$manyverse$metadata.about.name,
      avatar: msg.value._$manyverse$metadata.about.imageUrl ?? void 0,
    },
  };
}

export interface State {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  rootMsgId: MsgId | null;
  thread: PrivateThreadAndExtras;
  giftedMessages: Array<GiftedMsg>;
  avatarUrl?: string;
}

interface Actions {
  showMoreGiftedMessages$: Stream<any>;
}

export default function model(
  props$: Stream<Props>,
  ssbSource: SSBSource,
  actions: Actions,
): Stream<Reducer<State>> {
  const screenOpenedAt = Date.now();

  const propsReducer$ = props$.take(1).map(
    (props) =>
      function propsReducer(_prev?: State): State {
        if (props.rootMsgId) {
          return {
            selfFeedId: props.selfFeedId,
            selfAvatarUrl: props.selfAvatarUrl,
            rootMsgId: props.rootMsgId ?? null,
            thread: emptyThread,
            giftedMessages: [],
          };
        } else if (props.recps) {
          return {
            selfFeedId: props.selfFeedId,
            selfAvatarUrl: props.selfAvatarUrl,
            rootMsgId: null,
            thread: {
              full: true,
              messages: [],
              recps: props.recps,
            },
            giftedMessages: [
              {
                _id: 1,
                text: t('conversation.notifications.new_conversation'),
                createdAt: screenOpenedAt,
                system: true,
              } as any,
            ],
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
          const rootMsgId = thread.messages[0].key;
          const giftedMessages = thread.messages
            .slice(-MAX_GIFTED_MESSAGES_TO_LOAD)
            .map(toGiftedMessage)
            .reverse();
          if (!prev.rootMsgId) {
            return {...prev, thread, rootMsgId, giftedMessages};
          } else {
            return {...prev, thread, giftedMessages};
          }
        },
    );

  const showMoreGiftedMessagesReducer$ = actions.showMoreGiftedMessages$.mapTo(
    function showMoreGiftedMessagesReducer(prev: State): State {
      const PREV_SIZE = prev.giftedMessages.length;
      const more = prev.thread.messages
        .slice(-PREV_SIZE - MAX_GIFTED_MESSAGES_TO_LOAD, -PREV_SIZE)
        .map(toGiftedMessage)
        .reverse();
      return {...prev, giftedMessages: [...prev.giftedMessages, ...more]};
    },
  );

  const updateWithLiveRepliesReducer$ = rootMsgId$
    .map((rootMsgId) => ssbSource.threadUpdates$(rootMsgId, true))
    .flatten()
    .map(
      (newMsg: MsgAndExtras<PostContent>) =>
        function updateWithLiveRepliesReducer(prev: State): State {
          const newGiftedMsg = toGiftedMessage(newMsg);
          return {
            ...prev,
            giftedMessages: [newGiftedMsg, ...prev.giftedMessages],
            thread: {
              messages: [...prev.thread.messages, newMsg],
              recps: prev.thread.recps,
              full: true,
            },
          };
        },
    );

  return xs.merge(
    propsReducer$,
    loadExistingThreadReducer$,
    showMoreGiftedMessagesReducer$,
    updateWithLiveRepliesReducer$,
  );
}
