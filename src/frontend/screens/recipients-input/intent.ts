// SPDX-FileCopyrightText: 2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

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
      reactSource.select('topbar').events('pressBack'),
    ) as Stream<null>,

    goToNewConversation$: reactSource
      .select('recipientsInputNextButton')
      .events('press')
      .compose(sample(state$))
      .filter((state) => state.recipients.length > 0),
  };
}
