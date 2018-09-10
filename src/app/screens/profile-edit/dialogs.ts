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
import between from 'xstream-between';
import {NavSource} from 'cycle-native-navigation';
import {Request as DialogReq} from '../../drivers/dialogs';

export default function dialogs(
  navSource: NavSource,
  topBarBack$: Stream<any>,
) {
  const back$ = xs.merge(navSource.backPress(), topBarBack$);

  return back$
    .compose(between(navSource.didAppear(), navSource.didDisappear()))
    .mapTo(
      {
        title: 'Edit profile',
        category: 'edit-profile-discard',
        content: 'Discard changes?',
        positiveText: 'Discard',
        negativeText: 'Cancel',
      } as DialogReq,
    );
}
