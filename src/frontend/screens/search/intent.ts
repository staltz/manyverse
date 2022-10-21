// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {FeedId, Msg, MsgId, PostContent} from 'ssb-typescript';
import {
  isFeedSSBURI,
  isMessageSSBURI,
  toFeedSigil,
  toMessageSigil,
} from 'ssb-uri2';
const Ref = require('ssb-ref');
import {
  MsgAndExtras,
  PressAddReactionEvent,
  PressReactionsEvent,
} from '~frontend/ssb/types';
import {t} from '~frontend/drivers/localization';

interface ProfileNavEvent {
  authorFeedId: FeedId;
}

export default function intent(navSource: NavSource, reactSource: ReactSource) {
  const goBack$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events('pressBack'),
  );

  const queryInputChangeText$ = reactSource
    .select('queryInput')
    .events<string>('changeText');

  const updateQueryNow$ = queryInputChangeText$;

  const updateQueryDebounced$ = queryInputChangeText$.compose(debounce(500));

  const clearQuery$ = reactSource.select('clear').events('press');

  const shortcutToThread$ = xs.merge(
    updateQueryNow$.filter(Ref.isMsgId),
    updateQueryNow$.filter(isMessageSSBURI).map(toMessageSigil),
  ) as Stream<MsgId>;

  const shortcutToProfile$ = xs.merge(
    updateQueryNow$.filter(Ref.isFeedId),
    updateQueryNow$.filter(isFeedSSBURI).map(toFeedSigil),
  ) as Stream<FeedId>;

  const goToThread$ = xs.merge(
    reactSource
      .select('results')
      .events<MsgAndExtras<PostContent>>('pressResult'),

    reactSource.select('feed').events<MsgAndExtras<PostContent>>('pressExpand'),

    shortcutToThread$,
  );

  const clickOnProfile$ = reactSource
    .select('accounts')
    .events<{id: FeedId}>('pressAccount')
    .map(({id}) => id);

  const goToThreadReplies$ = reactSource
    .select('feed')
    .events<MsgAndExtras>('pressExpandReplies');

  const goToProfile$ = xs.merge(
    reactSource
      .select('feed')
      .events<ProfileNavEvent>('pressAuthor')
      .map((ev) => ev.authorFeedId),
    clickOnProfile$,
    shortcutToProfile$,
  );

  const goToAccounts$ = reactSource
    .select('feed')
    .events<PressReactionsEvent>('pressReactions')
    .map(({reactions}) => ({
      title: t('accounts.reactions.title'),
      accounts: reactions,
    }));

  const openMessageEtc$ = reactSource.select('feed').events<Msg>('pressEtc');

  const openMessageShare$ = reactSource
    .select('feed')
    .events<Msg>('pressShare');

  const goToThreadExpandCW$ = reactSource
    .select('feed')
    .events<MsgAndExtras>('pressExpandCW');

  const addReactionMsg$ = reactSource
    .select('feed')
    .events<PressAddReactionEvent>('pressAddReaction');

  return {
    goBack$,
    updateQueryNow$,
    updateQueryDebounced$,
    clearQuery$,
    goToThread$,
    goToThreadReplies$,
    goToProfile$,
    goToAccounts$,
    openMessageEtc$,
    openMessageShare$,
    goToThreadExpandCW$,
    addReactionMsg$,
  };
}
