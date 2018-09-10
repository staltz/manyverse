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
import {MsgId} from 'ssb-typescript';
import {ReactSource} from '@cycle/react';

export default function intent(reactSource: ReactSource) {
  return {
    goToCompose$: reactSource.select('fab').events('pressItem'),

    goToEdit$: reactSource.select('editProfile').events('press') as Stream<
      null
    >,

    goToThread$: xs.merge(
      reactSource.select('feed').events('pressExpandThread'),
      reactSource
        .select('feed')
        .events('pressReply')
        .map(({rootKey, msgKey}) => ({
          rootMsgId: rootKey,
          replyToMsgId: msgKey,
        })),
    ) as Stream<{rootMsgId: MsgId; replyToMsgId?: MsgId}>,

    likeMsg$: reactSource.select('feed').events('pressLike') as Stream<{
      msgKey: string;
      like: boolean;
    }>,

    follow$: reactSource.select('follow').events('press') as Stream<boolean>,
  };
}
