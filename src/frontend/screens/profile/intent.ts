/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {MsgId, FeedId, Msg} from 'ssb-typescript';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {PressReactionsEvent, PressAddReactionEvent} from '../../ssb/types';
import {State} from './model';

export type ProfileNavEvent = {authorFeedId: FeedId};

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
) {
  return {
    goBack$: xs.merge(
      navSource.backPress(),
      reactSource.select('topbar').events('pressBack'),
    ),

    goToCompose$: reactSource.select('fab').events('pressItem'),

    goToBio$: xs.merge(
      reactSource.select('bio').events('press'),
      reactSource
        .select('avatar')
        .events('press')
        .compose(sample(state$))
        .filter(state => !!state.about.imageUrl),
    ) as Stream<null>,

    goToEdit$: reactSource.select('editProfile').events('press') as Stream<
      null
    >,

    goToAccounts$: (reactSource
      .select('feed')
      .events('pressReactions') as Stream<PressReactionsEvent>).map(
      ({msgKey, reactions}) => ({
        title: 'Reactions',
        msgKey,
        accounts: reactions,
      }),
    ),

    goToProfile$: reactSource.select('feed').events('pressAuthor') as Stream<
      ProfileNavEvent
    >,

    openMessageEtc$: reactSource.select('feed').events('pressEtc') as Stream<
      Msg
    >,

    manageContact$: reactSource
      .select('manage')
      .events('press')
      .compose(sample(state$)),

    goToThread$: xs.merge(
      reactSource.select('feed').events('goToThread'),
      reactSource
        .select('feed')
        .events('pressReply')
        .map(({rootKey, msgKey}) => ({
          rootMsgId: rootKey,
          replyToMsgId: msgKey,
        })),
    ) as Stream<{rootMsgId: MsgId; replyToMsgId?: MsgId}>,

    addReactionMsg$: reactSource
      .select('feed')
      .events('pressAddReaction') as Stream<PressAddReactionEvent>,

    follow$: reactSource.select('follow').events('press') as Stream<boolean>,
  };
}
