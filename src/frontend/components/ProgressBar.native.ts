// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component, createElement as $} from 'react';
import {Animated, Easing, StyleSheet, View, ViewStyle} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Props} from './ProgressBar.web';

const FLARE_WIDTH = 6;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },

  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
  },

  barBrand: {
    backgroundColor: Palette.brandMain,
  },

  barBlank: {
    backgroundColor: Palette.textForBackgroundBrand,
  },

  flare: {
    position: 'absolute',
    left: -FLARE_WIDTH - 1,
    width: FLARE_WIDTH,
  },

  flareBrand: {
    backgroundColor: Palette.brandWeaker,
  },

  flareBlank: {
    backgroundColor: Palette.brandWeakest,
  },
});

type AnimatedViewStyle = Animated.WithAnimatedObject<ViewStyle>;

const SIDE_CLAMP = 2;

export default class ProgressBar extends Component<Props> {
  private width: number;
  private setupDone: boolean = false;
  private progressAnim: Animated.Value;
  private flareAnim: Animated.Value;
  private containerStyle: Array<ViewStyle> = null as any;
  private heightStyle: ViewStyle | null = null;
  private barStyleToRight: Array<AnimatedViewStyle> = null as any;
  private barStyleFromRight: Array<AnimatedViewStyle> = null as any;
  private barStyleFull: Array<AnimatedViewStyle> = null as any;
  private flareStyle: Array<AnimatedViewStyle> = null as any;
  private flareAnimating = false;
  private barTheme: ViewStyle | null = null;
  private flareTheme: ViewStyle | null = null;

  constructor(props: Props) {
    super(props);
    this.setup();
  }

  setup() {
    const {progress, disappearAt100, width, height, theme} = this.props;

    this.progressAnim = new Animated.Value(
      progress >= 1 && disappearAt100 ? 0 : progress,
    );
    this.flareAnim = new Animated.Value(0);
    const W = (this.width = width as number);
    const W2 = W * 0.5;
    this.heightStyle = {height: height};
    this.containerStyle = [styles.container, this.heightStyle, {width: W}];
    this.barTheme = theme === 'brand' ? styles.barBrand : styles.barBlank;
    this.flareTheme = theme === 'brand' ? styles.flareBrand : styles.flareBlank;

    const leftClamp = SIDE_CLAMP / W;
    const rightClamp = 1 - SIDE_CLAMP / W;
    const clampedProgressAnim = this.progressAnim.interpolate({
      inputRange: [0, leftClamp, rightClamp, 1],
      outputRange: [leftClamp, leftClamp, rightClamp, rightClamp],
    });

    this.barStyleToRight = [
      styles.bar,
      this.heightStyle,
      this.barTheme,
      {
        transform: [
          {translateX: -W2},
          {scaleX: clampedProgressAnim},
          {translateX: W2},
        ],
      },
    ];

    this.barStyleFromRight = [
      styles.bar,
      this.heightStyle,
      this.barTheme,
      {
        transform: [
          {translateX: W2},
          {scaleX: this.progressAnim},
          {translateX: -W2},
        ],
      },
    ];

    this.barStyleFull = [styles.bar, this.heightStyle, this.barTheme];

    this.flareStyle = [
      styles.flare,
      this.heightStyle,
      this.flareTheme,
      {
        transform: [
          {translateX: Animated.multiply(this.flareAnim, clampedProgressAnim)},
        ],
      },
    ];

    this.setupDone = true;
  }

  componentDidMount() {
    if (!this.setupDone) this.setup();
  }

  componentWillUnmount() {
    this.setupDone = false;
    this.progressAnim.stopAnimation();
    this.flareAnim.stopAnimation();
    this.flareAnimating = false;
    this.progressAnim = null as any;
    this.flareAnim = null as any;
    this.containerStyle = null as any;
    this.heightStyle = null;
    this.barStyleToRight = null as any;
    this.barStyleFromRight = null as any;
    this.flareStyle = null as any;
  }

  private startFlare() {
    this.flareAnimating = true;
    this.flareAnim.setValue(0);
    Animated.loop(
      Animated.timing(this.flareAnim, {
        toValue: this.width,
        duration: 1400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
        isInteraction: false,
      }),
    ).start();
  }

  private stopFlare() {
    this.flareAnimating = false;
    this.flareAnim.setValue(0);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const prevProgress = this.props.progress;
    const nextProgress = nextProps.progress;
    const prevWidth = this.props.width;
    const nextWidth = nextProps.width;

    // starting up:
    if (prevProgress <= 0 && nextProgress >= 1) {
      this.progressAnim.setValue(0);
    } else if (prevProgress <= 0 && nextProgress > 0) {
      if ((nextProps.appearAnimation ?? true) === true) {
        this.progressAnim.setValue(0);
        Animated.timing(this.progressAnim, {
          toValue: nextProgress,
          duration: 250,
          useNativeDriver: true,
          isInteraction: false,
        }).start();
      } else {
        this.progressAnim.setValue(nextProgress);
      }
      if (!this.flareAnimating) this.startFlare();
    }
    // finishing:
    else if (prevProgress < 1 && nextProgress >= 1) {
      this.progressAnim.setValue(1);
      Animated.timing(this.progressAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
      if (this.flareAnimating) this.stopFlare();
    }
    // in between:
    else if (nextProgress < 1 && prevProgress !== nextProgress) {
      this.progressAnim.stopAnimation();
      Animated.timing(this.progressAnim, {
        toValue: nextProgress,
        duration: 250,
        useNativeDriver: true,
        isInteraction: false,
      }).start();
      if (!this.flareAnimating) this.startFlare();
    }

    if (prevProgress <= 0 && nextProgress > 0) {
      return true;
    } else if (prevProgress > 0 && nextProgress <= 0) {
      return true;
    } else if (prevProgress < 1 && nextProgress >= 1) {
      return true;
    } else if (prevProgress >= 1 && nextProgress < 1) {
      return true;
    } else if (prevWidth !== nextWidth) {
      this.width = nextWidth as number;
      return true;
    }
    return false;
  }

  public render() {
    const {progress, disappearAt100} = this.props;
    const barStyle =
      progress >= 1 && !disappearAt100
        ? this.barStyleFull
        : progress >= 1
        ? this.barStyleFromRight
        : this.barStyleToRight;

    return $(View, {style: [...this.containerStyle, this.props.style]}, [
      this.props.progress > 0
        ? $(Animated.View, {key: 'bar', style: barStyle})
        : null,
      this.props.progress < 1
        ? $(Animated.View, {key: 'flare', style: this.flareStyle})
        : null,
    ]);
  }
}
