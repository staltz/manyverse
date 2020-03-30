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

export type State = {
  selfFeedId: FeedId;
  getPrivateFeedReadable: GetReadable<PrivateThreadAndExtras> | null;
  isVisible: boolean;
  updates: Set<MsgId>;
  updatesFlag: boolean;
  conversationOpen: MsgId | 'new' | null;
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
        if (prev.conversationOpen === 'new') return prev;

        // The updated conversation is already open, don't mark it read
        if (rootId === prev.conversationOpen) return prev;

        return {
          ...prev,
          updates: prev.updates.add(rootId),
          updatesFlag: !prev.updatesFlag,
        };
      },
  );

  const closeConversationReducer$ = navSource.didAppear().map(
    () =>
      function closeConversationReducer(prev: State): State {
        return {...prev, conversationOpen: null};
      },
  );

  const newConversationOpenReducer$ = actions.goToRecipientsInput$.map(
    () =>
      function newConversationOpenReducer(prev: State): State {
        return {
          ...prev,
          conversationOpen: 'new',
        };
      },
  );

  const markReadReducer$ = actions.goToConversation$.map(
    rootId =>
      function markReadReducer(prev: State): State {
        prev.updates.delete(rootId);
        return {
          ...prev,
          conversationOpen: rootId,
          updatesFlag: !prev.updatesFlag,
        };
      },
  );

  return xs.merge(
    setPrivateFeedReducer$,
    incUpdatesReducer$,
    closeConversationReducer$,
    newConversationOpenReducer$,
    markReadReducer$,
  );
}
