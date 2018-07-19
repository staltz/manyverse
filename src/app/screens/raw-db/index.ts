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
import {Command, PopCommand, NavSource} from 'cycle-native-navigation';
import {SSBSource} from '../../drivers/ssb';
import {ReactSource, h} from '@cycle/react';
import {ReactElement} from 'react';
import {Dimensions} from '../../global-styles/dimens';
import RawFeed from '../../components/RawFeed';

export type Sources = {
  screen: ReactSource;
  navigation: NavSource;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  navigation: Stream<Command>;
};

export const navOptions = {
  topBar: {
    height: Dimensions.toolbarAndroidHeight,
    title: {
      text: 'Raw database',
    },
    backButton: {
      icon: require('../../../../images/icon-arrow-left.png'),
      visible: true,
    },
  },
};

export function rawDatabase(sources: Sources): Sinks {
  const vdom$ = sources.ssb.publicRawFeed$.map(getReadable =>
    h(RawFeed, {getReadable}),
  );
  const command$ = sources.navigation.backPress().mapTo(
    {
      type: 'pop',
    } as PopCommand,
  );

  return {
    screen: vdom$,
    navigation: command$,
  };
}
