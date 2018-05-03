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
import {Content} from 'ssb-typescript';
import {toVoteContent, toReplyPostContent} from '../../../ssb/to-ssb';
import {State} from './model';

export type SSBActions = {
  likeMsg$: Stream<{msgKey: string; like: boolean}>;
  publishMsg$: Stream<State>;
};

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(actions: SSBActions): Stream<Content> {
  const toggleLikeMsg$ = actions.likeMsg$.map(toVoteContent);

  const publishReply$ = actions.publishMsg$.map(state =>
    toReplyPostContent(state.replyText, state.rootMsgId as string),
  );

  return xs.merge(toggleLikeMsg$, publishReply$);
}
