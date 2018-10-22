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
import {ReactSource} from '@cycle/react';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
import {DialogSource} from '../../../drivers/dialogs';
import showMsgEtcPicker from '../../../components/dialogs/MessageEtcPicker';

export type LikeEvent = {msgKey: string; like: boolean};
export type ProfileNavEvent = {authorFeedId: FeedId};
export type ThreadNavEvent = {rootMsgId: MsgId; replyToMsgId?: MsgId};

export default function intent(
  reactSource: ReactSource,
  dialogSource: DialogSource,
  fabPress$: Stream<string>,
) {
  const messageEtcChoice$ = reactSource
    .select('publicFeed')
    .events('pressEtc')
    .map((msg: Msg) => showMsgEtcPicker(msg, dialogSource))
    .flatten();

  return {
    goToCompose$: fabPress$.filter(action => action === 'compose'),

    likeMsg$: reactSource.select('publicFeed').events('pressLike') as Stream<
      LikeEvent
    >,

    goToProfile$: reactSource
      .select('publicFeed')
      .events('pressAuthor') as Stream<ProfileNavEvent>,

    goToRawMsg$: messageEtcChoice$
      .filter(choice => choice.id === 'raw-msg')
      .map(choice => choice.msg),

    resetUpdates$: reactSource.select('publicFeed').events('refresh') as Stream<
      any
    >,

    goToThread$: xs.merge(
      reactSource.select('publicFeed').events('pressExpandThread'),
      reactSource
        .select('publicFeed')
        .events('pressReply')
        .map(({rootKey, msgKey}) => ({
          rootMsgId: rootKey,
          replyToMsgId: msgKey,
        })),
    ) as Stream<ThreadNavEvent>,
  };
}
