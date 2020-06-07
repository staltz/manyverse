/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {StateSource} from '@cycle/state';
import {ReactElement} from 'react';
import {StyleSheet, Platform, Animated} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import HeaderMenuButton from '../../../components/HeaderMenuButton';
import {Typography} from '../../../global-styles/typography';
import {t} from '../../../drivers/localization';

export type State = {
  currentTab: 'public' | 'private' | 'connections';
  scrollHeaderBy: Animated.Value;
};

export type Sources = {
  screen: ReactSource;
  state: StateSource<State>;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  menuPress: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    zIndex: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: getStatusBarHeight() + Dimensions.verticalSpaceIOSTitle,
        left: 40,
        right: 40,
        textAlign: 'center',
        marginLeft: 0,
      },
      default: {
        marginLeft: Dimensions.horizontalSpaceLarge,
      },
    }),
  },
});

function intent(reactSource: ReactSource) {
  return {
    menu$: reactSource.select('menuButton').events('press'),
  };
}

function tabTitle(tab: State['currentTab']) {
  if (tab === 'public') {
    if (Platform.OS === 'ios') {
      return t('central.app_name');
    } else {
      return t('central.tab_headers.public');
    }
  }
  if (tab === 'private') {
    return t('central.tab_headers.private');
  }
  if (tab === 'connections') {
    return t('central.tab_headers.connections');
  }
  return '';
}

function calcTranslateY(scrollY: Animated.Value) {
  const minScroll = -getStatusBarHeight(true);
  const clampedScrollY = scrollY.interpolate({
    inputRange: [minScroll, minScroll + 1],
    outputRange: [0, 1],
    extrapolateLeft: 'clamp',
  });
  const translateY = Animated.diffClamp(
    clampedScrollY,
    0,
    Dimensions.toolbarHeight - getStatusBarHeight(true),
  );
  return Animated.multiply(translateY, -1);
}

function calcOpacity(scrollY: Animated.AnimatedMultiplication) {
  if (Platform.OS === 'android') return new Animated.Value(1);

  return scrollY.interpolate({
    inputRange: [-getStatusBarHeight(true), 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
}

function view(state$: Stream<State>) {
  const fixAtTop = new Animated.Value(0);
  const opaque = new Animated.Value(1);
  let hideYWhenScrolling: Animated.AnimatedMultiplication | null = null;
  let hideOpacityWhenScrolling: Animated.AnimatedMultiplication | null = null;

  return state$.map(state => {
    // Avoid re-instantiating a new animated value on every stream emission
    if (!hideYWhenScrolling) {
      hideYWhenScrolling = calcTranslateY(state.scrollHeaderBy);
    }
    if (!hideOpacityWhenScrolling) {
      hideOpacityWhenScrolling = calcOpacity(hideYWhenScrolling);
    }

    const translateY =
      state.currentTab === 'public' ? hideYWhenScrolling : fixAtTop;
    const opacity =
      state.currentTab === 'public' ? hideOpacityWhenScrolling : opaque;

    return h(
      Animated.View,
      {style: [styles.container, {transform: [{translateY}]}]},
      [
        h(Animated.View, {style: {opacity}}, [HeaderMenuButton('menuButton')]),
        h(
          Animated.Text,
          {style: [styles.title, {opacity}]},
          tabTitle(state.currentTab),
        ),
      ],
    );
  });
}

export function topBar(sources: Sources): Sinks {
  const actions = intent(sources.screen);
  const vdom$ = view(sources.state.stream);

  return {
    screen: vdom$,
    menuPress: actions.menu$,
  };
}
