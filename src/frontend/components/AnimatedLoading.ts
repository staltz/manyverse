/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {Palette} from '../global-styles/palette';

export const styles = StyleSheet.create({
  initialLoading: {
    marginVertical: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textVeryWeak,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default class AnimatedLoading extends PureComponent<{text: string}> {
  private loadingAnim = new Animated.Value(0);

  public componentDidMount() {
    // Breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.loadingAnim, {
          toValue: 0.6,
          duration: 2100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(this.loadingAnim, {
          toValue: 1,
          easing: Easing.linear,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }

  public render() {
    return $(
      View,
      null,
      $(
        Animated.Text,
        {style: [styles.initialLoading, {opacity: this.loadingAnim}]},
        this.props.text,
      ),
    );
  }
}
