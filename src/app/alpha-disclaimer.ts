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

import {h} from '@cycle/react';
import {View, Text} from 'react-native';
import {ReactElement} from 'react';

export function addDisclaimer(component: (so: any) => any) {
  return function withDisclaimer(sources: any) {
    const sinks = component(sources);
    const vdom$ = sinks.screen.map((vdom: ReactElement<any>) =>
      h(View, {style: {flex: 1}}, [
        vdom,
        h(
          Text,
          {
            style: {
              position: 'absolute',
              left: 0,
              bottom: 0,
              color: 'black',
              fontSize: 15,
              transform: [
                {rotateZ: '-90deg'},
                {translateY: -96},
                {translateX: 140},
              ],
            },
          },
          'Alpha version, not ready for use',
        ),
      ]),
    );
    return {...sinks, screen: vdom$};
  };
}
