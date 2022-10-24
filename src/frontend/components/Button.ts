// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
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
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {Palette} from '~frontend/global-styles/palette';
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
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  textStrong: {
    ...baseTextStyle,
    color: Palette.textForBackgroundBrand,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },
});

export interface Props {
  text: string;
  onPress?: () => void;
  strong?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export default class Button extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const props = this.props;
    if (nextProps.text !== props.text) return true;
    if (nextProps.onPress !== props.onPress) return true;
    if (nextProps.strong !== props.strong) return true;
    if (nextProps.small !== props.small) return true;
    if (nextProps.style !== props.style) return true;
    if (nextProps.textStyle !== props.textStyle) return true;
    if (nextProps.accessible !== props.accessible) return true;
    if (nextProps.accessibilityLabel !== props.accessibilityLabel) return true;
    return false;
  }

  private _onPress = () => {
    this.props.onPress?.();
  };

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
      onPress: this._onPress,
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
