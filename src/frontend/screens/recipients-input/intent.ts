// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {FeedId} from 'ssb-typescript';
import {isFeedSSBURI, toFeedSigil} from 'ssb-uri2';
const Ref = require('ssb-ref');
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {PrivateThreadAndExtras} from '~frontend/ssb/types';
import {State} from './model';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
) {
  const changeText$ = reactSource
    .select('mentionInput')
    .events<string>('changeText')
    .debug('updateQuery$');

  const addRecipient$ = xs.merge(
    changeText$.filter(Ref.isFeedId),
    changeText$.filter(isFeedSSBURI).map(toFeedSigil),
  ) as Stream<FeedId>;

  const updateQuery$ = changeText$.filter(
    (str) => !Ref.isFeedId(str) && !isFeedSSBURI(str),
  );

  const updateRecipients$ = reactSource
    .select('recipients')
    .events<PrivateThreadAndExtras['recps']>('updated');

  const maxReached$ = reactSource
    .select('recipients')
    .events<undefined>('maxReached');

  const goBack$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events<null>('pressBack'),
  );

  const goToNewConversation$ = reactSource
    .select('recipientsInputNextButton')
    .events('press')
    .compose(sample(state$));

  return {
    updateQuery$,
    addRecipient$,
    updateRecipients$,
    maxReached$,
    goBack$,
    goToNewConversation$,
  };
}
