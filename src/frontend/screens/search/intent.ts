/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {FeedId, MsgId, PostContent} from 'ssb-typescript';
import {
  isFeedSSBURI,
  isMessageSSBURI,
  toFeedSigil,
  toMessageSigil,
} from 'ssb-uri2';
const Ref = require('ssb-ref');
import {MsgAndExtras} from '../../ssb/types';

export default function intent(navSource: NavSource, reactSource: ReactSource) {
  const goBack$ = xs.merge(
    navSource.backPress(),
    reactSource.select('topbar').events('pressBack'),
  );

  const queryInputChangeText$ = reactSource
    .select('queryInput')
    .events('changeText') as Stream<string>;

  const updateQueryNow$ = queryInputChangeText$;

  const updateQueryDebounced$ = queryInputChangeText$.compose(debounce(500));

  const clearQuery$ = reactSource.select('clear').events('press');

  const shortcutToThread$ = xs.merge(
    updateQueryNow$.filter(Ref.isMsgId),

    updateQueryNow$
      .map((str) => {
        if (!isMessageSSBURI(str)) return null;
        const msgId = toMessageSigil(str);
        if (!Ref.isMsgId(msgId)) return null;
        return msgId;
      })
      .filter((x) => !!x) as Stream<MsgId>,
  );

  const shortcutToAccount$ = xs.merge(
    updateQueryNow$.filter(Ref.isFeedId),

    updateQueryNow$
      .map((str) => {
        if (!isFeedSSBURI(str)) return null;
        const feedId = toFeedSigil(str);
        if (!Ref.isFeedId(feedId)) return null;
        return feedId;
      })
      .filter((x) => !!x) as Stream<FeedId>,
  );

  const goToThread$ = xs.merge(
    reactSource.select('results').events('pressResult') as Stream<
      MsgAndExtras<PostContent>
    >,

    shortcutToThread$,
  );

  const goToAccount$ = shortcutToAccount$;

  return {
    goBack$,
    updateQueryNow$,
    updateQueryDebounced$,
    clearQuery$,
    goToThread$,
    goToAccount$,
  };
}
