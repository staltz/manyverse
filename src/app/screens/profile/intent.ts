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
import {Screens} from '../..';

export type LikeEvent = {msgKey: string; like: boolean};

export default function intent(source: ScreensSource) {
  return {
    goToCompose$: source.select('feed').events('openCompose'),

    likeMsg$: source.select('feed').events('pressLike') as Stream<LikeEvent>,

    follow$: source.select('follow').events('press') as Stream<boolean>,

    goToEdit$: source.select('editProfile').events('press') as Stream<null>,

    appear$: source.willAppear(Screens.Profile).mapTo(null),

    disappear$: source.didDisappear(Screens.Profile).mapTo(null),
  };
}
