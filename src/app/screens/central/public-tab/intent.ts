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
import {FeedId, MsgId} from 'ssb-typescript';

export type LikeEvent = {msgKey: string; like: boolean};
export type ProfileNavEvent = {authorFeedId: FeedId};
export type ThreadNavEvent = {rootMsgId: MsgId; replyToMsgId?: MsgId};

export default function intent(source: ReactSource, fabPress$: Stream<string>) {
  return {
    goToCompose$: fabPress$.filter(action => action === 'compose'),

    likeMsg$: source.select('publicFeed').events('pressLike') as Stream<
      LikeEvent
    >,

    goToProfile$: source.select('publicFeed').events('pressAuthor') as Stream<
      ProfileNavEvent
    >,

    resetUpdates$: source.select('publicFeed').events('refresh') as Stream<any>,

    goToThread$: xs.merge(
      source.select('publicFeed').events('pressExpandThread'),
      source
        .select('publicFeed')
        .events('pressReply')
        .map(({rootKey, msgKey}) => ({
          rootMsgId: rootKey,
          replyToMsgId: msgKey,
        })),
    ) as Stream<ThreadNavEvent>,
  };
}
