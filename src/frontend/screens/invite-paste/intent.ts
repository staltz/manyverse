/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import between from 'xstream-between';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {NavSource} from 'cycle-native-navigation';
import {State} from './model';
import {LifecycleEvent} from '../../drivers/lifecycle';

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  topBarDone$: Stream<any>,
  state$: Stream<State>,
  keyboardSource: KeyboardSource,
  lifecycle$: Stream<LifecycleEvent>,
) {
  const activityPaused$ = lifecycle$.filter(ev => ev === 'paused');
  const activityResumed$ = lifecycle$.filter(ev => ev === 'resumed');
  const composeAppeared$ = navSource.didAppear();
  const composeDisappearing$ = navSource.didDisappear();
  const done$ = topBarDone$
    .compose(sample(state$))
    .map(state => state.content)
    .filter(text => text.length > 0);

  return {
    dhtDone$: done$.filter(text => text.substr(0, 4) === 'dht:'),

    normalDone$: done$.filter(text => text.substr(0, 4) !== 'dht:'),

    updateContent$: reactSource
      .select('contentInput')
      .events('changeText') as Stream<string>,

    quitFromKeyboard$: keyboardSource
      .events('keyboardDidHide')
      .compose(
        between(
          xs.merge(composeAppeared$, activityResumed$).compose(delay(100)),
          xs.merge(composeDisappearing$, activityPaused$),
        ),
      ),
  };
}
