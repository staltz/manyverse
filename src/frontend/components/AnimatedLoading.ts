// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {Animated, Easing, Platform, StyleSheet, Text, View} from 'react-native';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {Palette} from '~frontend/global-styles/palette';

const LOW_OPACITY = 0.5;
const HIGH_OPACITY = 1;
const IN_DURATION = 2100;
const OUT_DURATION = 2400;
const WEB_DELAY_FADE_DURATION = 2000;
const fadeDuration = `${WEB_DELAY_FADE_DURATION}ms`;
const loopDuration = `${IN_DURATION + OUT_DURATION}ms`;
const fadeAndLoopDuration = `${fadeDuration}, ${loopDuration}`;

export const styles = StyleSheet.create({
  text: {
    marginVertical: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textVeryWeak,
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      web: {
        opacity: '0' as any,
        width: Dimensions.desktopMiddleWidth.px,
        animationDuration: loopDuration,
        animationDirection: 'normal',
        animationTimingFunction: 'ease',
        animationKeyframes: [
          {
            '0%': {opacity: LOW_OPACITY},
            '40%': {opacity: HIGH_OPACITY},
            '100%': {opacity: LOW_OPACITY},
          },
        ],
        animationIterationCount: 'infinite',
      },
    }),
  },

  textWebDelay: {
    ...Platform.select({
      web: {
        animationDuration: fadeAndLoopDuration,
        animationDirection: 'normal, normal',
        animationTimingFunction: 'linear, ease',
        animationKeyframes: [
          {
            '0%': {opacity: '0'},
            '100%': {opacity: LOW_OPACITY},
          },
          {
            '0%': {opacity: LOW_OPACITY},
            '40%': {opacity: HIGH_OPACITY},
            '100%': {opacity: LOW_OPACITY},
          },
        ],
        animationIterationCount: '1, infinite',
      } as any,
    }),
  },
});

export default class AnimatedLoading extends PureComponent<{
  text: string;
  delay?: number;
  selectable?: boolean;
}> {
  private loadingAnim = new Animated.Value(0);

  public componentDidMount() {
    if (Platform.OS !== 'web') {
      this.loadingAnim ??= new Animated.Value(0);
      const {delay} = this.props;
      Animated.sequence([
        // Take `delay` milliseconds to slowly fade in
        delay ? Animated.delay(delay * 0.5) : Animated.delay(0),
        delay
          ? Animated.timing(this.loadingAnim, {
              toValue: HIGH_OPACITY,
              duration: delay * 0.5,
              useNativeDriver: true,
            })
          : Animated.delay(0),
      ]).start(({finished}) => {
        if (finished) this.repeat();
      });
    }
  }

  public componentWillUnmount() {
    this.loadingAnim.stopAnimation();
    this.loadingAnim = null as any;
  }

  public repeat() {
    if (this.loadingAnim) {
      this.loadingAnim.setValue(HIGH_OPACITY);
    } else {
      this.loadingAnim = new Animated.Value(HIGH_OPACITY);
    }
    // Breathing animation
    Animated.sequence([
      Animated.timing(this.loadingAnim, {
        toValue: LOW_OPACITY,
        duration: IN_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(this.loadingAnim, {
        toValue: HIGH_OPACITY,
        easing: Easing.linear,
        duration: OUT_DURATION,
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) this.repeat();
    });
  }

  public render() {
    const {delay} = this.props;
    if (Platform.OS === 'web') {
      const appearDelay = (delay ?? 0) - WEB_DELAY_FADE_DURATION;
      return $(
        View,
        null,
        $(
          Text,
          {
            style: [
              styles.text,
              delay ? styles.textWebDelay : null,
              delay
                ? ({
                    animationDelay: `${appearDelay}ms, ${delay}ms`,
                  } as any)
                : null,
            ],
          },
          this.props.text,
        ),
      );
    } else {
      return $(
        View,
        null,
        $(
          Animated.Text,
          {
            selectable: this.props.selectable ?? false,
            style: [styles.text, {opacity: this.loadingAnim}],
          },
          this.props.text,
        ),
      );
    }
  }
}
