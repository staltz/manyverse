/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {
  View,
  TextStyle,
  Text,
  TouchableNativeFeedback,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {Palette} from '../global-styles/palette';
import {h} from '@cycle/react';

export const baseContainerStyle = {
  borderTopLeftRadius: 3,
  borderTopRightRadius: 3,
  borderBottomLeftRadius: 3,
  borderBottomRightRadius: 3,
  paddingLeft: Dimensions.horizontalSpaceNormal,
  paddingRight: Dimensions.horizontalSpaceNormal,
  paddingTop: Dimensions.verticalSpaceSmall,
  paddingBottom: Dimensions.verticalSpaceSmall,
};

export const baseTextStyle: TextStyle = {
  fontSize: Typography.fontSizeNormal,
  textAlign: 'center',
  fontWeight: 'bold',
};

export const styles = StyleSheet.create({
  container: {
    ...baseContainerStyle,
    backgroundColor: 'transparent',
    borderColor: Palette.backgroundBrand,
    borderWidth: 1,
  },

  containerStrong: {
    ...baseContainerStyle,
    backgroundColor: Palette.backgroundBrand,
    borderWidth: 0,
  },

  text: {
    ...baseTextStyle,
    color: Palette.textBrand,
  },

  textStrong: {
    ...baseTextStyle,
    color: Palette.foregroundBrand,
  },
});

export type Props = {
  text: string;
  onPress?: () => void;
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
  accessible?: boolean;
  accessibilityLabel?: string;
};

export default class Button extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const props = this.props;
    return nextProps.text !== props.text || nextProps.strong !== props.strong;
  }

  public render() {
    const {text, strong, style, accessible, accessibilityLabel} = this.props;

    const touchableProps = {
      background: TouchableNativeFeedback.Ripple(Palette.backgroundBrand),
      onPress: () => {
        if (this.props.onPress) {
          this.props.onPress();
        }
      },
      accessible,
      accessibilityLabel,
    };

    const viewProps = {
      style: [
        strong ? styles.containerStrong : styles.container,
        style,
      ] as ViewStyle,
    };

    return h(TouchableNativeFeedback, touchableProps, [
      h(View, viewProps, [
        h(Text, {style: strong ? styles.textStrong : styles.text}, text),
      ]),
    ]);
  }
}
