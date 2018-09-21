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
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {View, StyleSheet} from 'react-native';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import HeaderBackButton from '../../../components/HeaderBackButton';
import HeaderButton from '../../../components/HeaderButton';
import {ReactElement} from 'react';

export type Sources = {
  screen: ReactSource;
  props: Stream<any>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  share: Stream<any>;
  back: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarAndroidHeight,
    alignSelf: 'stretch',
    backgroundColor: Palette.brand.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },
});

function intent(reactSource: ReactSource) {
  return {
    back$: reactSource.select('inviteBackButton').events('press'),

    share$: reactSource.select('inviteShareButton').events('press'),
  };
}

export function topBar(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = xs.of(
    h(View, {style: styles.container}, [
      HeaderBackButton('inviteBackButton'),
      h(HeaderButton, {
        sel: 'inviteShareButton',
        icon: 'share',
        accessibilityLabel: 'Share Button',
        rightSide: true,
      }),
    ]),
  );

  return {
    screen: vdom$,
    share: actions.share$,
    back: actions.back$,
  };
}
