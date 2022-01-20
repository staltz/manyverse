// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
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
      reactSource.select('bio').events<null>('press'),
      reactSource
        .select('avatar')
        .events<null>('press')
        .compose(sample(state$))
        .filter((state) => !!state.about.imageUrl),
    ),

    goToEdit$: reactSource.select('editProfile').events<null>('press'),

    goToAccounts$: xs.merge(
      reactSource
        .select('feed')
        .events<PressReactionsEvent>('pressReactions')
        .map(({reactions}) => ({
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

    goToProfile$: reactSource
      .select('feed')
      .events<ProfileNavEvent>('pressAuthor'),

    openMessageEtc$: reactSource.select('feed').events<Msg>('pressEtc'),

    refreshFeed$: reactSource.select('feed').events<any>('refresh'),

    manageContact$: reactSource
      .select('manage')
      .events('press')
      .compose(sample(state$)),

    goToFeedId$: reactSource.select('feedId').events<any>('press'),

    consumeAlias$: reactSource.select('aliases').events<Alias>('pressAlias'),

    goToThread$: reactSource.select('feed').events<MsgAndExtras>('pressExpand'),

    goToThreadExpandCW$: reactSource
      .select('feed')
      .events<MsgAndExtras>('pressExpandCW'),

    addReactionMsg$: reactSource
      .select('feed')
      .events<PressAddReactionEvent>('pressAddReaction'),

    follow$: reactSource.select('follow').events<boolean>('press'),
  };
}
