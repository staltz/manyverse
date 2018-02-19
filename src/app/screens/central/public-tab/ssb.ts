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
import {Content, PostContent, VoteContent} from '../../../../ssb/types';

export type LikeEvent = {msgKey: string; like: boolean};

export type Actions = {
  publishMsg$: Stream<string>;
  likeMsg$: Stream<LikeEvent>;
};

export default function ssb(actions: Actions): Stream<Content> {
  // TODO: this is duplicate also in profile/ssb. deduplicate it
  const publishMsg$ = actions.publishMsg$.map(text => {
    return {
      text,
      type: 'post',
      mentions: [],
    } as PostContent;
  });

  const toggleLikeMsg$ = actions.likeMsg$.map(ev => {
    return {
      type: 'vote',
      vote: {
        link: ev.msgKey,
        value: ev.like ? 1 : 0,
        expression: ev.like ? 'Like' : 'Unlike',
      },
    } as VoteContent;
  });

  return xs.merge(publishMsg$, toggleLikeMsg$);
}
