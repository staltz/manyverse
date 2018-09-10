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
import {State} from './model';
import {IFloatingActionProps as Props} from 'react-native-floating-action';
import {Palette} from '../../../global-styles/palette';

export default function floatingAction(state$: Stream<State>): Stream<Props> {
  return state$.map(
    state =>
      ({
        sel: 'fab',
        color: Palette.brand.callToActionBackground,
        visible: !!state.selfFeedId,
        actions: [
          {
            color: Palette.brand.callToActionBackground,
            name: 'compose',
            icon: require('../../../../../images/pencil.png'),
            text: 'Write a public message',
          },
        ],
        overrideWithAction: true,
        iconHeight: 24,
        iconWidth: 24,
      } as Props),
  );
}
