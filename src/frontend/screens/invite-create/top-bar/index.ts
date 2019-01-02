/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
    backgroundColor: Palette.backgroundBrand,
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
