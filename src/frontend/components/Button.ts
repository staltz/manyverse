// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {
  View,
  TextStyle,
  Text,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {Palette} from '../global-styles/palette';
import {h} from '@cycle/react';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const baseContainerStyle = {
  borderTopLeftRadius: 3,
  borderTopRightRadius: 3,
  borderBottomLeftRadius: 3,
  borderBottomRightRadius: 3,
};

export const baseTextStyle: TextStyle = {
  fontSize: Typography.fontSizeNormal,
  textAlign: 'center',
};

export const styles = StyleSheet.create({
  container: {
    ...baseContainerStyle,
    backgroundColor: 'transparent',
    borderColor: Palette.isDarkTheme ? Palette.textBrand : Palette.brandMain,
    borderWidth: 1,
  },

  containerStrong: {
    ...baseContainerStyle,
    backgroundColor: Palette.brandMain,
    borderWidth: 0,
  },

  containerSize: {
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceSmall,
  },

  containerSizeSmall: {
    paddingHorizontal: Dimensions.horizontalSpaceSmall,
    paddingVertical: Dimensions.verticalSpaceTiny,
  },

  textWeight: {
    fontWeight: 'bold',
  },

  text: {
    ...baseTextStyle,
    color: Palette.textBrand,
  },

  textStrong: {
    ...baseTextStyle,
    color: Palette.textForBackgroundBrand,
  },
});

export type Props = {
  text: string;
  onPress?: () => void;
  strong?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
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
    const {
      text,
      strong,
      small,
      style,
      textStyle,
      accessible,
      accessibilityLabel,
    } = this.props;

    const touchableProps: any = {
      onPress: () => {
        if (this.props.onPress) {
          this.props.onPress();
        }
      },
      accessible,
      accessibilityRole: 'button',
      accessibilityLabel,
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.Ripple(
        strong ? Palette.transparencyDarkStrong : Palette.brandMain,
        false,
      );
    }

    const viewProps = {
      pointerEvents: 'box-only' as const,
      style: [
        strong ? styles.containerStrong : styles.container,
        small ? styles.containerSizeSmall : styles.containerSize,
        style,
      ] as ViewStyle,
    };

    return h(Touchable, touchableProps, [
      h(View, viewProps, [
        h(
          Text,
          {
            style: [
              strong ? styles.textStrong : styles.text,
              small ? null : styles.textWeight,
              textStyle,
            ],
          },
          text,
        ),
      ]),
    ]);
  }
}
