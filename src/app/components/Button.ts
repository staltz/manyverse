/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
    borderColor: Palette.brand.background,
    borderWidth: 1,
  },

  containerStrong: {
    ...baseContainerStyle,
    backgroundColor: Palette.brand.background,
    borderWidth: 0,
  },

  text: {
    ...baseTextStyle,
    color: Palette.brand.background,
  },

  textStrong: {
    ...baseTextStyle,
    color: Palette.white,
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
      background: TouchableNativeFeedback.Ripple(Palette.brand.background),
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
