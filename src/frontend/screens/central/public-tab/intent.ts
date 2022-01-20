// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {ReactSource} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';
import {NavSource} from 'cycle-native-navigation';
import {Screens} from '../../enums';
import {
  PressAddReactionEvent,
  PressReactionsEvent,
  MsgAndExtras,
} from '../../../ssb/types';
import {t} from '../../../drivers/localization';

export type ProfileNavEvent = {authorFeedId: FeedId};

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  fabPress$: Stream<string>,
) {
  const feedRefreshed$ = reactSource
    .select('publicFeed')
    .events('refresh') as Stream<any>;

  return {
    goToCompose$: fabPress$.filter((action) => action === 'compose'),

    goToAccounts$: (
      reactSource
        .select('publicFeed')
        .events('pressReactions') as Stream<PressReactionsEvent>
    ).map(({msgKey, reactions}) => ({
      title: t('accounts.reactions.title'),
      msgKey,
      accounts: reactions,
    })),

    addReactionMsg$: reactSource
      .select('publicFeed')
      .events('pressAddReaction') as Stream<PressAddReactionEvent>,

    goToProfile$: xs.merge(
      reactSource.select('publicFeed').events('pressAuthor'),
    ) as Stream<ProfileNavEvent>,

    openMessageEtc$: reactSource
      .select('publicFeed')
      .events('pressEtc') as Stream<Msg>,

    initializationDone$: reactSource
      .select('publicFeed')
      .events('initialPullDone') as Stream<void>,

    refreshFeed$: feedRefreshed$,

    updateSessionTimestamp$: feedRefreshed$.compose(debounce(2e3)),

    refreshComposeDraft$: navSource
      .globalDidDisappear(Screens.Compose)
      .startWith(null as any) as Stream<any>,

    goToThread$: reactSource
      .select('publicFeed')
      .events('pressExpand') as Stream<MsgAndExtras>,

    goToThreadExpandCW$: reactSource
      .select('publicFeed')
      .events('pressExpandCW') as Stream<MsgAndExtras>,
  };
}
