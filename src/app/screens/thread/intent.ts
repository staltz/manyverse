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

import {Stream} from 'xstream';
import {ScreensSource} from 'cycle-native-navigation';
import {FeedId} from 'ssb-typescript';
import {Screens} from '../..';
import {State} from './model';
import sampleCombine from 'xstream/extra/sampleCombine';

export type ProfileNavEvent = {authorFeedId: FeedId};

export type LikeEvent = {msgKey: string; like: boolean};

export default function intent(source: ScreensSource, state$: Stream<State>) {
  return {
    publishMsg$: source
      .select('replyButton')
      .events('press')
      .compose(sampleCombine(state$))
      .map(([_, state]) => state)
      .filter(state => !!state.replyText && !!state.rootMsgId),

    appear$: source.willAppear(Screens.Thread).mapTo(null),

    disappear$: source.didDisappear(Screens.Thread).mapTo(null),

    likeMsg$: source.select('thread').events('pressLike') as Stream<LikeEvent>,

    updateReplyText$: source
      .select('replyInput')
      .events('changeText') as Stream<string>,

    goToProfile$: source.select('thread').events('pressAuthor') as Stream<
      ProfileNavEvent
    >,
  };
}
