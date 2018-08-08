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
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {StateSource} from 'cycle-onionify';
import {View, Text, StyleSheet} from 'react-native';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import AndroidMenuButton from '../../../components/AndroidMenuButton';
import {ReactElement} from 'react';
import {Typography} from '../../../global-styles/typography';

export type State = {
  title: string;
};

export type Sources = {
  screen: ReactSource;
  props: Stream<any>;
  onion: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  menuPress: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarAndroidHeight,
    alignSelf: 'stretch',
    backgroundColor: Palette.brand.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  title: {
    marginLeft: Dimensions.horizontalSpaceBig,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.white,
    fontSize: Typography.fontSizeLarge,
    fontWeight: 'bold',
  },
});

function intent(reactSource: ReactSource) {
  return {
    menu$: reactSource.select('menuButton').events('press'),
  };
}

function view(state$: Stream<State>) {
  return state$.map(state =>
    h(View, {style: styles.container}, [
      h(AndroidMenuButton, {sel: 'menuButton'}),
      h(Text, {style: styles.title}, state.title),
    ]),
  );
}

export function topBar(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.onion.state$);

  return {
    screen: vdom$,
    menuPress: actions.menu$,
  };
}
