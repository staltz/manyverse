/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View, StyleSheet} from 'react-native';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {propifyMethods} from 'react-propify-methods';
import {ReactElement} from 'react';
const Swiper = propifyMethods<any, any, any>(
  require('react-native-swiper'),
  'scrollBy',
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Palette.brandMain,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },
});

export type Props = {
  scrollBy$?: Stream<[/* offset */ number, /* animated */ boolean]>;
};

export default function tutorialPresentation(
  sel: string | symbol,
  props: Props | null,
  children: Array<ReactElement | null>,
) {
  return h(View, {style: styles.container}, [
    h(
      Swiper,
      {
        sel,
        showsButtons: false,
        horizontal: true,
        loop: false,
        scrollBy$: props?.scrollBy$ ?? xs.never(),
        activeDotColor: Palette.colors.white,
        automaticallyAdjustContentInsets: true,
      },
      children.filter((x) => !!x),
    ),
  ]);
}
