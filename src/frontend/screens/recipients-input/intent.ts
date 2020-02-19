/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {PrivateThreadAndExtras} from '../../../shared-types';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  topBarBack$: Stream<any>,
  topBarNext$: Stream<any>,
) {
  return {
    updateQuery$: reactSource
      .select('mentionInput')
      .events('changeText') as Stream<string>,

    updateRecipients$: reactSource
      .select('recipients')
      .events('updated') as Stream<PrivateThreadAndExtras['recps']>,

    maxReached$: reactSource
      .select('recipients')
      .events('maxReached') as Stream<undefined>,

    goBack$: xs.merge(navSource.backPress(), topBarBack$) as Stream<null>,

    goToNewConversation$: topBarNext$,
  };
}
