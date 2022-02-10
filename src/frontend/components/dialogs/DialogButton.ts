// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {
  View,
  Text,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {Dimensions} from '~frontend/global-styles/dimens';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    ...Platform.select({
      default: {
        justifyContent: 'center',
        width: 70,
        height: 40,
        position: 'absolute',
        bottom: Dimensions.verticalSpaceLarge,
        right: Dimensions.horizontalSpaceBig,
      },
      ios: {
        minHeight: 48,
        justifyContent: 'center',
        borderTopColor: Palette.backgroundTextWeak,
        borderTopWidth: 1,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
      },
    }),
  },

  text: {
    textAlignVertical: 'center',
    ...Platform.select({
      default: {
        color: Palette.text,
        fontWeight: 'bold',
        fontSize: Typography.fontSizeNormal,
        lineHeight: Typography.lineHeightNormal,
        textAlign: 'right',
      },
      ios: {
        color: Palette.textBrand,
        fontWeight: 'normal',
        fontSize: Typography.fontSizeBig,
        lineHeight: Typography.lineHeightBig,
        textAlign: 'center',
      },
    }),
  },
});

export type Props = {
  text: string;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
};

export default class DialogButton extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const props = this.props;
    return nextProps.text !== props.text;
  }

  public render() {
    const {text, accessible, accessibilityLabel} = this.props;

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
        Palette.transparencyDarkStrong,
        false,
      );
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.container, pointerEvents: 'box-only'}, [
        h(Text, {style: styles.text}, text),
      ]),
    ]);
  }
}
