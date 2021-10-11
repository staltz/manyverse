// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import between from 'xstream-between';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {NavSource} from 'cycle-native-navigation';
import {State} from './model';
import {LifecycleEvent} from '../../drivers/lifecycle';
const roomUtils = require('ssb-room-client/utils');

export default function intent(
  reactSource: ReactSource,
  navSource: NavSource,
  state$: Stream<State>,
  keyboardSource: KeyboardSource,
  lifecycle$: Stream<LifecycleEvent>,
) {
  const activityPaused$ = lifecycle$.filter((ev) => ev === 'paused');
  const activityResumed$ = lifecycle$.filter((ev) => ev === 'resumed');
  const composeAppeared$ = navSource.didAppear();
  const composeDisappearing$ = navSource.didDisappear();

  const done$ = reactSource
    .select('inviteAcceptButton')
    .events('press')
    .compose(sample(state$))
    .map((state) => state.content)
    .filter((text) => text.length > 0);

  return {
    back$: xs.merge(
      navSource.backPress(),
      reactSource.select('topbar').events('pressBack'),
    ),

    done$,

    dhtDone$: done$.filter((text) => text.startsWith('dht:')),

    roomDone$: done$.filter(
      (text) => !text.startsWith('dht:') && roomUtils.isInvite(text),
    ),

    normalDone$: done$.filter(
      (text) => !text.startsWith('dht:') && !roomUtils.isInvite(text),
    ),

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
