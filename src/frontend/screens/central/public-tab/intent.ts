// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {ReactSource} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';
import {NavSource} from 'cycle-native-navigation';
import {Screens} from '~frontend/screens/enums';
import {
  PressAddReactionEvent,
  PressReactionsEvent,
  MsgAndExtras,
} from '~frontend/ssb/types';
import {t} from '~frontend/drivers/localization';

export interface ProfileNavEvent {
  authorFeedId: FeedId;
}

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  fabPress$: Stream<string>,
) {
  const feedRefreshed$ = reactSource
    .select('publicFeed')
    .events<any>('refresh');

  return {
    goToCompose$: fabPress$.filter((action) => action === 'compose'),

    goToAccounts$: reactSource
      .select('publicFeed')
      .events<PressReactionsEvent>('pressReactions')
      .map(({msgKey, reactions}) => ({
        title: t('accounts.reactions.title'),
        msgKey,
        accounts: reactions,
      })),

    addReactionMsg$: reactSource
      .select('publicFeed')
      .events<PressAddReactionEvent>('pressAddReaction'),

    goToProfile$: reactSource
      .select('publicFeed')
      .events<ProfileNavEvent>('pressAuthor'),

    openMessageEtc$: reactSource.select('publicFeed').events<Msg>('pressEtc'),

    initializationDone$: reactSource
      .select('publicFeed')
      .events<void>('initialPullDone'),

    refreshFeed$: feedRefreshed$,

    updateSessionTimestamp$: feedRefreshed$.compose(debounce(2e3)),

    refreshComposeDraft$: navSource
      .globalDidDisappear(Screens.Compose)
      .startWith(null as any) as Stream<any>,

    goToThread$: reactSource
      .select('publicFeed')
      .events<MsgAndExtras>('pressExpand'),

    goToThreadReplies$: reactSource
      .select('publicFeed')
      .events<MsgAndExtras>('pressExpandReplies'),

    goToThreadExpandCW$: reactSource
      .select('publicFeed')
      .events<MsgAndExtras>('pressExpandCW'),
  };
}
