/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {NavSource} from 'cycle-native-navigation';
import {PrivateThreadAndExtras} from '../../ssb/types';
import {State} from './model';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
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

    goBack$: xs.merge(
      navSource.backPress(),
      reactSource.select('recipientsInputBackButton').events('press'),
    ) as Stream<null>,

    goToNewConversation$: reactSource
      .select('recipientsInputNextButton')
      .events('press')
      .compose(sample(state$))
      .filter(state => state.recipients.length > 0),
  };
}
