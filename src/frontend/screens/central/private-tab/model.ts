/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {FeedId, MsgId} from 'ssb-typescript';
import {GetReadable, SSBSource} from '../../../drivers/ssb';
import {PrivateThreadAndExtras} from '../../../ssb/types';
import {NavSource} from 'cycle-native-navigation';
import {Screens} from '../../enums';
import {
  Props as ConversationProps,
  isExistingConversationProps,
  isNewConversationProps,
} from '../../conversation/props';

export type State = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  getPrivateFeedReadable: GetReadable<PrivateThreadAndExtras> | null;
  isVisible: boolean;
  updates: Set<MsgId>;
  updatesFlag: boolean;
  conversationsOpen: Map<string, string>;
};

export default function model(ssbSource: SSBSource, navSource: NavSource) {
  /**
   * Wait for some time, to give priority to other queries at startup-time
   * such as those for the public-tab, which must appear before.
   */
  const initialWait$ = xs.periodic(5000).take(1);

  const setPrivateFeedReducer$ = initialWait$
    .map(() => ssbSource.privateFeed$)
    .flatten()
    .map(
      (getReadable) =>
        function setPrivateFeedReducer(prev: State): State {
          return {...prev, getPrivateFeedReadable: getReadable};
        },
    );

  const incUpdatesReducer$ = initialWait$
    .map(() => ssbSource.privateLiveUpdates$)
    .flatten()
    .map(
      (rootId) =>
        function incUpdatesReducer(prev: State): State {
          // The updated conversation is already open, don't mark it read
          if (prev.conversationsOpen.has(rootId)) return prev;

          return {
            ...prev,
            updates: prev.updates.add(rootId),
            updatesFlag: !prev.updatesFlag,
          };
        },
    );

  const newConversationOpenedReducer$ = navSource
    .globalDidAppear(Screens.Conversation)
    .filter((ev) => isNewConversationProps(ev.passProps as any))
    .map((appear) => {
      const conversationDisappears$ = navSource
        .globalDidDisappear(Screens.Conversation)
        .filter((disappear) => disappear.componentId === appear.componentId);
      return ssbSource.selfPrivateRootIdsLive$
        .map((msgKey) => [msgKey, appear.componentId])
        .endWhen(conversationDisappears$)
        .take(1);
    })
    .flatten()
    .map(
      ([rootMsgId, componentId]) =>
        function newRootReducer(prev: State): State {
          prev.updates.delete(rootMsgId); // mark the new conversation read
          if (prev.conversationsOpen.has(rootMsgId)) {
            return {
              ...prev,
              updatesFlag: !prev.updatesFlag,
            };
          }
          // store in both directions
          prev.conversationsOpen.set(rootMsgId, componentId);
          prev.conversationsOpen.set(componentId, rootMsgId);
          return {
            ...prev,
            conversationsOpen: prev.conversationsOpen,
            updatesFlag: !prev.updatesFlag,
          };
        },
    );

  const oldConversationOpenedReducer$ = navSource
    .globalDidAppear(Screens.Conversation)
    .map(
      (ev) =>
        function conversationOpenedReducer(prev: State): State {
          const props = ev.passProps as ConversationProps;
          if (!isExistingConversationProps(props)) return prev;
          const {rootMsgId} = props;
          const {conversationsOpen} = prev;
          prev.updates.delete(rootMsgId); // mark the conversation read
          if (conversationsOpen.has(rootMsgId)) {
            return {
              ...prev,
              updatesFlag: !prev.updatesFlag,
            };
          }
          // store in both directions
          conversationsOpen.set(rootMsgId, ev.componentId);
          conversationsOpen.set(ev.componentId, rootMsgId);
          return {
            ...prev,
            conversationsOpen,
            updatesFlag: !prev.updatesFlag,
          };
        },
    );

  const conversationClosedReducer$ = navSource
    .globalDidDisappear(Screens.Conversation)
    .map(
      (ev) =>
        function conversationClosedReducer(prev: State): State {
          const {conversationsOpen} = prev;
          if (conversationsOpen.has(ev.componentId)) {
            // delete in both directions
            const rootMsgId = conversationsOpen.get(ev.componentId)!;
            conversationsOpen.delete(ev.componentId);
            conversationsOpen.delete(rootMsgId);
            return {...prev, conversationsOpen};
          } else {
            return prev;
          }
        },
    );

  return xs.merge(
    setPrivateFeedReducer$,
    incUpdatesReducer$,
    newConversationOpenedReducer$,
    oldConversationOpenedReducer$,
    conversationClosedReducer$,
  );
}
