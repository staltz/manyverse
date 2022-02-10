// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import {h} from '@cycle/react';
import {View, StyleSheet, Platform} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {propifyMethods} from 'react-propify-methods';
import {ReactElement} from 'react';
const Swiper =
  Platform.OS === 'web'
    ? propifyMethods<any, any, any>(require('./Swiper').default, 'scrollBy')
    : propifyMethods<any, any, any>(require('react-native-swiper'), 'scrollBy');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Palette.brandMain,
  },
});

export interface Props {
  scrollBy$?: Stream<[/* offset */ number, /* animated */ boolean]>;
  showDots?: boolean;
}

export default function tutorialPresentation(
  sel: string | symbol,
  props: Props | null,
  children: Array<ReactElement | null>,
) {
  const showDots = props?.showDots ?? true;
  return h(View, {style: styles.container}, [
    h(
      Swiper,
      {
        sel,
        showsButtons: false,
        horizontal: true,
        loop: false,
        scrollBy$: props?.scrollBy$ ?? xs.never(),
        dotColor: showDots ? Palette.transparencyDark : Palette.brandMain,
        activeDotColor: showDots ? Palette.colors.white : Palette.brandMain,
        automaticallyAdjustContentInsets: true,
      },
      children.filter((x) => !!x),
    ),
  ]);
}
