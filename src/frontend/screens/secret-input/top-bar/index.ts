/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {StateSource} from '@cycle/state';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import HeaderBackButton from '../../../components/HeaderBackButton';

export type State = {
  practiceMode: boolean;
};

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  back: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundBrand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  title: {
    marginLeft: Dimensions.horizontalSpaceLarge,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeLarge,
    fontWeight: 'bold',
  },
});

export function topBar(sources: Sources): Sinks {
  const vdom$ = sources.state.stream.map(state =>
    h(View, {style: styles.container}, [
      HeaderBackButton('secretInputBackButton'),
      h(
        Text,
        {style: styles.title},
        state.practiceMode ? 'Practice' : 'Restore account',
      ),
    ]),
  );

  const back$ = sources.screen.select('secretInputBackButton').events('press');

  return {
    screen: vdom$,
    back: back$,
  };
}
