/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {Animated, ViewStyle, StyleSheet} from 'react-native';
import {Dimensions} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';
import {State} from '../model';
import {AVATAR_SIZE} from './styles';

const DOT_SIZE = AVATAR_SIZE * 0.1739;

const dotStyle: ViewStyle = {
  position: 'absolute',
  top:
    Dimensions.toolbarHeight +
    Dimensions.verticalSpaceLarge +
    AVATAR_SIZE * 0.75,
  left: Dimensions.horizontalSpaceBig + AVATAR_SIZE * 0.78,
  width: DOT_SIZE,
  height: DOT_SIZE,
  borderRadius: DOT_SIZE * 0.5,
  zIndex: 100,
  borderColor: Palette.backgroundText,
  borderWidth: 1,
};

const styles = StyleSheet.create({
  connectedDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerConnected,
  },

  connectingDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerConnecting,
  },

  disconnectingDot: {
    ...dotStyle,
    backgroundColor: Palette.backgroundPeerDisconnecting,
  },
});

export default function ConnectionDot({
  state,
  translateX,
  translateY,
  scale,
}: {
  state: State;
  translateX: Animated.AnimatedInterpolation;
  translateY: Animated.AnimatedInterpolation;
  scale: Animated.AnimatedInterpolation;
}) {
  const animStyle = {transform: [{translateX}, {translateY}, {scale}]};

  return h(Animated.View, {
    style: [
      state.connection === 'connected'
        ? styles.connectedDot
        : state.connection === 'disconnecting'
        ? styles.disconnectingDot
        : styles.connectingDot,
      animStyle,
    ],
  });
}
