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

import xs, {Stream, Listener} from 'xstream';
import {ReactElement} from 'react';
import {View, Text} from 'react-native';
import {StateSource, Reducer} from 'cycle-onionify';
import {
  ScreenVNode,
  Command,
  PushCommand,
  ScreensSource,
} from 'cycle-native-navigation';
import {navigatorStyle as profileNavigatorStyle} from '../../profile/styles';
import {SSBSource} from '../../../drivers/ssb';
import {PeerMetadata} from '../../../../ssb/types';
import view, {basicIcon} from './view';
import intent, {Actions} from './intent';

export type Sources = {
  screen: ScreensSource;
  onion: StateSource<any>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  onion: Stream<Reducer<any>>;
  navigation: Stream<Command>;
};

function navigationCommands(
  actions: Actions,
): Stream<Command> {
  const profile$: Stream<Command> = actions.goToSelfProfile$.mapTo(
    {
      type: 'push',
      screen: 'mmmmm.Profile',
      navigatorStyle: profileNavigatorStyle,
      animated: true,
      animationType: 'slide-horizontal',
    } as PushCommand,
  );
  return profile$;
}

export function extraTab(sources: Sources): Sinks {
  // They all point to self-profile as other screens are still unimplemented
  const navItems = xs.of([
      {icon: basicIcon('account-box'), text: 'My profile', targetSelector: 'self-profile'},
      {icon: basicIcon('account-multiple'), text: 'Groups', targetSelector: 'self-profile'},
      {icon: basicIcon('pound'), text: 'Channels', targetSelector: 'self-profile'},
      {icon: basicIcon('calendar'), text: 'Events', targetSelector: 'self-profile'},
      {icon: basicIcon('pulse'), text: 'Metadata', targetSelector: 'self-profile'},
      {icon: basicIcon('settings'), text: 'Settings', targetSelector: 'self-profile'},
  ]);
  const vdom$ = view(navItems);
  const reducer$ = xs.empty();

  const command$ = navigationCommands(intent(sources.screen));

  return {
    screen: vdom$,
    onion: reducer$,
    navigation: command$,
  };
}
