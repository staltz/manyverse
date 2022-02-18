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
const roomUtils = require('ssb-room-client/utils');
import {isExperimentalSSBURIWithAction} from 'ssb-uri2';
import {LifecycleEvent} from '~frontend/drivers/lifecycle';
import {State} from './model';

const isDhtInvite = (text: string) => text.startsWith('dht:');
const isHttpsInvite = (text: string) => text.startsWith('https://');
const isUriInvite = isExperimentalSSBURIWithAction('claim-http-invite');
const isRoom1InviteCode = (text: string) => roomUtils.isInvite(text);
const isRoom2InviteCode = (text: string) =>
  isHttpsInvite(text) || isUriInvite(text);

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

    dhtInviteDone$: done$.filter(isDhtInvite),

    room1InviteDone$: done$.filter(isRoom1InviteCode),

    room2InviteDone$: done$.filter(isRoom2InviteCode),

    miscInviteDone$: done$.filter(
      (text) =>
        !isDhtInvite(text) &&
        !isRoom1InviteCode(text) &&
        !isRoom2InviteCode(text),
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
