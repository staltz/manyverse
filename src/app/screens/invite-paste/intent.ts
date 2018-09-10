/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
