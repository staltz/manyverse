/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {MsgAndExtras} from '../../ssb/types';
import {PostContent} from 'ssb-typescript';
const Ref = require('ssb-ref');

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

  const shortcutToThread$ = updateQueryNow$.filter(Ref.isMsgId);

  const shortcutToAccount$ = updateQueryNow$.filter(Ref.isFeedId);

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
