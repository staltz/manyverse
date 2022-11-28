// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {StyleSheet, Animated} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {State} from '../model';
import {AVATAR_SIZE, AVATAR_SIZE_TOOLBAR} from './styles';

interface PropsType1 {
  state: State;
  inTopBar: true;
  opacity: Animated.AnimatedInterpolation;
  transY: Animated.AnimatedInterpolation;
}

interface PropsType2 {
  state: State;
  inTopBar: false;
  opacity?: undefined;
  transY?: undefined;
}

const RATIO = 0.1739;
const DOT_SIZE = AVATAR_SIZE * RATIO;
const DOT_SIZE_TOOLBAR = AVATAR_SIZE_TOOLBAR * RATIO;

const styles = StyleSheet.create({
  baseStyle: {
    position: 'absolute',
    zIndex: 100,
    borderColor: Palette.backgroundText,
    borderWidth: 1,
  },

  inHeader: {
    top: AVATAR_SIZE * 0.75,
    left: AVATAR_SIZE * 0.78,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE * 0.5,
  },

  inTopBar: {
    top:
      (Dimensions.toolbarHeight -
        getStatusBarHeight(true) -
        AVATAR_SIZE_TOOLBAR) *
        0.5 +
      AVATAR_SIZE_TOOLBAR * 0.75,
    left: Dimensions.horizontalSpaceBig + AVATAR_SIZE_TOOLBAR * 0.78,
    width: DOT_SIZE_TOOLBAR,
    height: DOT_SIZE_TOOLBAR,
    borderRadius: DOT_SIZE_TOOLBAR * 0.5,
  },

  connectedDot: {
    backgroundColor: Palette.backgroundPeerConnected,
  },

  connectingDot: {
    backgroundColor: Palette.backgroundPeerConnecting,
  },

  disconnectingDot: {
    backgroundColor: Palette.backgroundPeerDisconnecting,
  },
});

export default function ConnectionDot({
  state,
  inTopBar,
  opacity,
  transY,
}: PropsType1 | PropsType2) {
  const animStyle = inTopBar
    ? {opacity: opacity!, transform: [{translateY: transY!}]}
    : null;

  const colorStyle =
    state.connection === 'connected'
      ? styles.connectedDot
      : state.connection === 'disconnecting'
      ? styles.disconnectingDot
      : styles.connectingDot;

  return h(Animated.View, {
    style: [
      styles.baseStyle,
      inTopBar ? styles.inTopBar : styles.inHeader,
      colorStyle,
      animStyle,
    ],
  });
}
