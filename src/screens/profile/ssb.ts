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
import sampleCombine from 'xstream/extra/sampleCombine';
import {State} from './model';
import {
  Content,
  PostContent,
  VoteContent,
  ContactContent,
} from '../../ssb/types';

export type SSBActions = {
  publishMsg$: Stream<string>;
  likeMsg$: Stream<{msgKey: string; like: boolean}>;
  follow$: Stream<boolean>;
};

/**
 * Define streams of new content to be flushed onto SSB.
 */
export default function ssb(
  actions: SSBActions,
  state$: Stream<State>,
): Stream<Content> {
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

  const followProfileMsg$ = actions.follow$
    .compose(sampleCombine(state$))
    .map(([following, state]) => {
      return {
        type: 'contact',
        following,
        contact: state.displayFeedId,
      } as ContactContent;
    });

  return xs.merge(publishMsg$, toggleLikeMsg$, followProfileMsg$);
}
