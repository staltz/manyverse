/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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
import {ScreensSource} from 'cycle-native-navigation';
import {KeyboardSource} from '@cycle/native-keyboard';
import {Screens} from '../..';
import {State} from './model';
import {LifecycleEvent} from '../../drivers/lifecycle';

export default function intent(
  screenSource: ScreensSource,
  publish$: Stream<any>,
  state$: Stream<State>,
  keyboardSource: KeyboardSource,
  lifecycle$: Stream<LifecycleEvent>,
) {
  const activityPaused$ = lifecycle$.filter(ev => ev === 'paused');
  const activityResumed$ = lifecycle$.filter(ev => ev === 'resumed');
  const composeAppeared$ = screenSource.didAppear(Screens.Compose);
  const composeDisappearing$ = screenSource.willDisappear(Screens.Compose);

  return {
    publishMsg$: publish$
      .compose(sample(state$))
      .map(state => state.postText)
      .filter(text => text.length > 0),

    updatePostText$: screenSource
      .select('composeInput')
      .events('changeText') as Stream<string>,

    willDisappear$: screenSource.willDisappear(Screens.Compose),

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
