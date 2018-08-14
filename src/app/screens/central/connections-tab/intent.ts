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
import {ReactSource} from '@cycle/react';
import {FeedId} from 'ssb-typescript';

export default function intent(reactSource: ReactSource) {
  return {
    showLANHelp$: reactSource.select('lan-help').events('press').mapTo(null),

    goToPeerProfile$: xs.merge(
      reactSource.select('lan-peers').events('pressPeer'),
      reactSource.select('pub-peers').events('pressPeer'),
    ) as Stream<FeedId>,

    goToPasteInvite$: reactSource
      .select('invites')
      .events('pressPaste')
      .mapTo(null),
  };
}
