/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {View, Text, StyleSheet} from 'react-native';
import Slider from '@react-native-community/slider';
import {Palette} from '../../../global-styles/palette';
import {Typography} from '../../../global-styles/typography';
import {Dimensions} from '../../../global-styles/dimens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: Dimensions.verticalSpaceNormal,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    minHeight: 60,
  },

  title: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    color: Palette.text,
  },

  valueInTitle: {
    fontWeight: 'bold',
    marginLeft: Dimensions.horizontalSpaceNormal,
  },

  subtitle: {
    fontSize: Typography.fontSizeSmall,
    lineHeight: Typography.lineHeightSmall,
    color: Palette.textWeak,
    marginBottom: Dimensions.verticalSpaceNormal,
  },
});

export type Props = {
  title: string;
  subtitle?: string;
  accessibilityLabel: string;
  options: Array<string>;
  initial: number;
  onChange?: (val: number) => void;
};

type State = {
  current?: number;
};

export default class SliderSetting extends PureComponent<Props, State> {
  public state: State = {};

  private onSlide = (current: number) => {
    this.setState({current});
  };

  private onSlidingComplete = () => {
    this.props.onChange?.(this.state.current ?? 0);
  };

  public render() {
    const {title, subtitle, options, initial, accessibilityLabel} = this.props;
    const {current} = this.state;

    return h(
      View,
      {style: styles.container, accessible: true, accessibilityLabel},
      [
        h(Text, {style: styles.title}, [
          title + ': ',
          h(Text, {style: styles.valueInTitle}, options[current ?? initial]),
        ]),
        subtitle ? h(Text, {style: styles.subtitle}, subtitle) : null,
        h(Slider, {
          minimumValue: 0,
          maximumValue: options.length - 1,
          step: 1,
          value: initial,
          minimumTrackTintColor: Palette.backgroundBrand,
          onValueChange: this.onSlide,
          onSlidingComplete: this.onSlidingComplete,
        }),
      ],
    );
  }
}
