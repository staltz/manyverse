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
import {View, Text, ScrollView} from 'react-native';
import {ScreensSource, ScreenVNode, Command} from 'cycle-native-navigation';
import {h} from '@cycle/native-screen';
import {StateSource, Reducer} from 'cycle-onionify';
import {styles} from './styles';
import {SSBSource} from '../../drivers/ssb';
import {Screens} from '../..';
import model, {State} from './model';
// import intent from './intent';
// import navigation from './navigation';
import DrawerMenuItem from '../../components/DrawerMenuItem';

export type Sources = {
  screen: ScreensSource;
  onion: StateSource<State>;
  ssb: SSBSource;
};

export type Sinks = {
  screen: Stream<ScreenVNode>;
  navigation: Stream<Command>;
  onion: Stream<Reducer<State>>;
};

function renderName(name?: string) {
  const namelessStyle = !name ? styles.noAuthorName : null;
  return h(
    Text,
    {
      style: [styles.authorName, namelessStyle],
      numberOfLines: 1,
      ellipsizeMode: 'middle',
    },
    name || 'No name',
  );
}

function view(state$: Stream<State>): Stream<ScreenVNode> {
  return state$.map(state => ({
    screen: Screens.Drawer,
    vdom: h(View, {style: styles.container}, [
      h(View, {style: styles.header}, [
        h(View, {style: styles.authorImage}),
        renderName(state.name),
        h(
          Text,
          {style: styles.authorId, numberOfLines: 1, ellipsizeMode: 'middle'},
          state.selfFeedId,
        ),
      ]),
      h(ScrollView, {style: null}, [
        h(DrawerMenuItem, {
          selector: 'self-profile',
          icon: 'account-box',
          text: 'My profile',
          accessible: true,
          accessibilityLabel: 'My Profile Menu Item',
        }),
        h(DrawerMenuItem, {icon: 'email', text: 'Email bug report'}),
        // incoming+staltz/mmmmm-mobile@incoming.gitlab.com
        h(DrawerMenuItem, {icon: 'database', text: 'Raw database'}),
        h(DrawerMenuItem, {icon: 'information', text: 'About MMMMM'}),
      ]),
    ]),
  }));
}

export function drawer(sources: Sources): Sinks {
  // const actions = intent(sources.screen);
  const vdom$ = view(sources.onion.state$);
  // const command$ = navigation(actions);
  const reducer$ = model(sources.onion.state$, sources.ssb);
  return {
    screen: vdom$,
    navigation: xs.never(),
    onion: reducer$,
  };
}
