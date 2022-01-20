// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import delay from 'xstream/extra/delay';
import between from 'xstream-between';
import sample from 'xstream-sample';
import {ReactSource} from '@cycle/react';
import {KeyboardSource} from 'cycle-native-keyboard';
import {NavSource} from 'cycle-native-navigation';
import {isExperimentalSSBURIWithAction} from 'ssb-uri2';
import {LifecycleEvent} from '../../drivers/lifecycle';
import {State} from './model';
const roomUtils = require('ssb-room-client/utils');

const isHttpInvite = isExperimentalSSBURIWithAction('claim-http-invite');

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

    room1Done$: done$.filter(
      (text) =>
        !text.startsWith('dht:') &&
        !text.startsWith('https://') &&
        !isHttpInvite(text) &&
        roomUtils.isInvite(text),
    ),

    room2Done$: done$.filter(
      (text) => isHttpInvite(text) || text.startsWith('https://'),
    ),

    normalDone$: done$.filter(
      (text) =>
        !text.startsWith('dht:') &&
        !text.startsWith('https://') &&
        !isHttpInvite(text) &&
        !roomUtils.isInvite(text),
    ),

    updateContent$: reactSource
      .select('contentInput')
      .events<string>('changeText'),

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
