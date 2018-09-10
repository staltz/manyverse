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

import {Stream} from 'xstream';
import sample from 'xstream-sample';
import {isReplyPostMsg} from 'ssb-typescript/utils';
import {FeedId} from 'ssb-typescript';
import {State} from './model';
import {SSBSource} from '../../drivers/ssb';
import {ReactSource} from '@cycle/react';
import {KeyboardSource} from 'cycle-native-keyboard';

export default function intent(
  reactSource: ReactSource,
  keyboardSource: KeyboardSource,
  ssbSource: SSBSource,
  state$: Stream<State>,
) {
  return {
    publishMsg$: reactSource
      .select('replyButton')
      .events('press')
      .compose(sample(state$))
      .filter(state => !!state.replyText && !!state.rootMsgId),

    willReply$: ssbSource.publishHook$.filter(isReplyPostMsg),

    keyboardAppeared$: keyboardSource.events('keyboardDidShow').mapTo(null),

    keyboardDisappeared$: keyboardSource.events('keyboardDidHide').mapTo(null),

    likeMsg$: reactSource.select('thread').events('pressLike') as Stream<{
      msgKey: string;
      like: boolean;
    }>,

    updateReplyText$: reactSource
      .select('replyInput')
      .events('changeText') as Stream<string>,

    goToProfile$: reactSource.select('thread').events('pressAuthor') as Stream<{
      authorFeedId: FeedId;
    }>,
  };
}
