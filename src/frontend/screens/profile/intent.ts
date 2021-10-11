// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {FeedId, Msg} from 'ssb-typescript';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {t} from '../../drivers/localization';
import {
  PressReactionsEvent,
  PressAddReactionEvent,
  MsgAndExtras,
  Alias,
} from '../../ssb/types';
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
        .filter((state) => !!state.about.imageUrl),
    ) as Stream<null>,

    goToEdit$: reactSource.select('editProfile').events('press') as Stream<
      null
    >,

    goToAccounts$: xs.merge(
      (reactSource.select('feed').events('pressReactions') as Stream<
        PressReactionsEvent
      >).map(({reactions}) => ({
        title: t('accounts.reactions.title'),
        accounts: reactions,
      })),

      reactSource
        .select('following')
        .events('press')
        .compose(sample(state$))
        .filter((state) => !!state.following && state.following!.length > 0)
        .map((state) => ({
          title: t('profile.details.counters.following'),
          accounts: state.following!,
        })),

      reactSource
        .select('followers')
        .events('press')
        .compose(sample(state$))
        .filter((state) => !!state.followers && state.followers!.length > 0)
        .map((state) => ({
          title: t('profile.details.counters.followers'),
          accounts: state.followers!,
        })),
    ),

    goToProfile$: reactSource.select('feed').events('pressAuthor') as Stream<
      ProfileNavEvent
    >,

    openMessageEtc$: reactSource.select('feed').events('pressEtc') as Stream<
      Msg
    >,

    refreshFeed$: reactSource.select('feed').events('refresh') as Stream<any>,

    manageContact$: reactSource
      .select('manage')
      .events('press')
      .compose(sample(state$)),

    goToFeedId$: reactSource.select('feedId').events('press') as Stream<any>,

    consumeAlias$: reactSource.select('aliases').events('pressAlias') as Stream<
      Alias
    >,

    goToThread$: reactSource.select('feed').events('pressExpand') as Stream<
      MsgAndExtras
    >,

    goToThreadExpandCW$: reactSource
      .select('feed')
      .events('pressExpandCW') as Stream<MsgAndExtras>,

    addReactionMsg$: reactSource
      .select('feed')
      .events('pressAddReaction') as Stream<PressAddReactionEvent>,

    follow$: reactSource.select('follow').events('press') as Stream<boolean>,
  };
}
