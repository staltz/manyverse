/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, ReactElement} from 'react';
import {
  StyleSheet,
  View,
  ImageSourcePropType,
  TextProps,
  Animated,
  Easing,
} from 'react-native';
import {h} from '@cycle/react';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: Palette.brandMain,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  title: {
    fontWeight: 'bold',
    marginVertical: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeLarger,
    lineHeight: Typography.lineHeightLarger,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    textAlign: 'center',
  },

  desc: {
    flexWrap: 'wrap',
    marginVertical: Dimensions.verticalSpaceSmall,
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyReadableText,
    marginHorizontal: Dimensions.horizontalSpaceBig,
    textAlign: 'center',
  },

  image: {
    width: 96,
    height: 96,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  bold: {
    fontWeight: 'bold',
  },

  slide: {
    flex: 1,
    flexDirection: 'column',
  },

  slideTop: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  slideBottom: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

type SlideProps = {
  image: ImageSourcePropType;
  title: string;
  renderDescription: () => Array<string | ReactElement<TextProps>>;
  renderBottom: () => ReactElement<any> | Array<ReactElement<any>>;
  show: boolean;
  portraitMode?: boolean;
};

class InternalSlide extends PureComponent<SlideProps> {
  private animVal1: Animated.Value;
  private animVal2: Animated.Value;
  private animVal3: Animated.Value;
  private animVal4: Animated.Value;

  public componentWillMount() {
    this.animVal1 = new Animated.Value(0);
    this.animVal2 = new Animated.Value(0);
    this.animVal3 = new Animated.Value(0);
    this.animVal4 = new Animated.Value(0);
  }

  public componentDidMount() {
    if (this.props.show) {
      this._enter();
    }
  }

  public componentDidUpdate(prevProps: SlideProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.show === true && prevProps.show === false) {
      this._enter();
    } else if (this.props.show === false && prevProps.show === true) {
      this._exit();
    }

    // Reset image transparency to full opaque when
    // changing orientation (after animation has ended)
    if (
      this.props.portraitMode === true &&
      prevProps.portraitMode === false &&
      this.props.show === true &&
      prevProps.show === true
    ) {
      this.animVal1.setValue(1);
    }
  }

  private _startIt(animVal: Animated.Value, delay: number) {
    animVal.setValue(0);
    const opts: Parameters<typeof Animated.timing>[1] = {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    };
    if (delay > 0) opts.delay = delay;
    Animated.timing(animVal, opts).start();
  }

  private _enter() {
    this._startIt(this.animVal1, 0);
    this._startIt(this.animVal2, 70);
    this._startIt(this.animVal3, 140);
    this._startIt(this.animVal4, 400);
  }

  private _exit() {
    this.animVal1.setValue(0);
    this.animVal2.setValue(0);
    this.animVal3.setValue(0);
    this.animVal4.setValue(0);
  }

  public render() {
    const {
      image,
      title,
      renderDescription,
      renderBottom,
      portraitMode,
    } = this.props;

    const INTERPOLATION = {inputRange: [0, 1], outputRange: [20, 0]};

    const imageAnimStyle = {
      opacity: this.animVal1,
      transform: [
        {
          translateX: this.animVal1.interpolate(INTERPOLATION),
        },
      ],
    };

    const titleAnimStyle = {
      opacity: this.animVal2,
      transform: [
        {
          translateX: this.animVal2.interpolate(INTERPOLATION),
        },
      ],
    };

    const descAnimStyle = {
      opacity: this.animVal3,
      transform: [
        {
          translateX: this.animVal3.interpolate(INTERPOLATION),
        },
      ],
    };

    const bottomAnimStyle = {
      opacity: this.animVal4,
    };

    const bottom = renderBottom();

    return h(View, {style: [styles.slide]}, [
      h(View, {style: styles.slideTop}, [
        portraitMode === true || typeof portraitMode === 'undefined'
          ? h(Animated.Image, {
              style: [styles.image, imageAnimStyle],
              source: image,
            })
          : null,
        h(Animated.Text, {style: [styles.title, titleAnimStyle]}, title),
        h(
          Animated.Text,
          {style: [styles.desc, descAnimStyle], textBreakStrategy: 'simple'},
          renderDescription(),
        ),
      ]),

      h(
        Animated.View,
        {style: [styles.slideBottom, bottomAnimStyle]},
        Array.isArray(bottom) ? bottom : [bottom],
      ),
    ]);
  }
}

/**
 * We need to use a function instead of a React Component because the way
 * react-native-swiper works requires us to pass Views as children of the
 * Swiper, nothing else than View works as children of the Swiper.
 */
export default function tutorialSlide(props: SlideProps): ReactElement<any> {
  return h(View, {style: styles.slide}, [h(InternalSlide, props)]);
}
