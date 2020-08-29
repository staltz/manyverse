/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {FeedId, MsgId} from 'ssb-typescript';
import {GetReadable, SSBSource} from '../../../drivers/ssb';
import {PrivateThreadAndExtras} from '../../../ssb/types';
import {NavSource} from 'cycle-native-navigation';
import {Screens} from '../../enums';
import {Props as ConversationProps} from '../../conversation/props';

export type State = {
  selfFeedId: FeedId;
  selfAvatarUrl?: string;
  getPrivateFeedReadable: GetReadable<PrivateThreadAndExtras> | null;
  isVisible: boolean;
  updates: Set<MsgId>;
  updatesFlag: boolean;
  conversationsOpen: Map<string, string>;
};

export type Actions = {
  goToConversation$: Stream<MsgId>;
  goToRecipientsInput$: Stream<any>;
};

export default function model(
  ssbSource: SSBSource,
  navSource: NavSource,
  actions: Actions,
) {
  const setPrivateFeedReducer$ = ssbSource.privateFeed$.map(
    getReadable =>
      function setPrivateFeedReducer(prev: State): State {
        return {...prev, getPrivateFeedReadable: getReadable};
      },
  );

  const incUpdatesReducer$ = ssbSource.privateLiveUpdates$.map(
    rootId =>
      function incUpdatesReducer(prev: State): State {
        // FIXME: this if guard also means that every other new root will be
        // ignored, not just the one that *we* are creating.
        if (prev.conversationsOpen.has('new')) return prev;

        // The updated conversation is already open, don't mark it read
        if (prev.conversationsOpen.has(rootId)) return prev;

        return {
          ...prev,
          updates: prev.updates.add(rootId),
          updatesFlag: !prev.updatesFlag,
        };
      },
  );

  const conversationOpenedReducer$ = navSource
    .globalDidAppear(Screens.Conversation)
    .map(
      ev =>
        function conversationOpenedReducer(prev: State): State {
          const conversationProps = ev.passProps as ConversationProps;
          const {selfFeedId, recps, rootMsgId} = conversationProps;
          const {conversationsOpen} = prev;
          if (!selfFeedId) return prev;
          if (rootMsgId) {
            prev.updates.delete(rootMsgId);
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
          } else if (Array.isArray(recps)) {
            if (conversationsOpen.has('new')) return prev;
            // store in both directions
            conversationsOpen.set('new', ev.componentId);
            conversationsOpen.set(ev.componentId, 'new');
            return {
              ...prev,
              conversationsOpen,
              updatesFlag: !prev.updatesFlag,
            };
          } else {
            return prev;
          }
        },
    );

  const conversationClosedReducer$ = navSource
    .globalDidDisappear(Screens.Conversation)
    .map(
      ev =>
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
    conversationOpenedReducer$,
    conversationClosedReducer$,
  );
}
