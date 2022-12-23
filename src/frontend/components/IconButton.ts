// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {
  View,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {h} from '@cycle/react';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: Dimensions.borderRadiusNormal,
    borderTopRightRadius: Dimensions.borderRadiusNormal,
    borderBottomLeftRadius: Dimensions.borderRadiusNormal,
    borderBottomRightRadius: Dimensions.borderRadiusNormal,
    backgroundColor: 'transparent',
    borderColor: Palette.isDarkTheme ? Palette.textBrand : Palette.brandMain,
    borderWidth: 1,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceSmall,
  },
});

export interface Props {
  icon: string;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export default class Button extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const props = this.props;
    if (nextProps.icon !== props.icon) return true;
    if (nextProps.onPress !== props.onPress) return true;
    if (nextProps.accessible !== props.accessible) return true;
    if (nextProps.accessibilityLabel !== props.accessibilityLabel) return true;
    return false;
  }

  private _onPress = () => {
    this.props.onPress?.();
  };

  public render() {
    const {icon, accessible, accessibilityLabel} = this.props;

    const touchableProps: any = {
      onPress: this._onPress,
      accessible,
      accessibilityRole: 'button',
      accessibilityLabel,
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.Ripple(
        Palette.brandMain,
        false,
      );
    }

    const viewProps = {
      pointerEvents: 'box-only' as const,
      style: styles.container as ViewStyle,
    };

    return h(Touchable, touchableProps, [
      h(View, viewProps, [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.textBrand,
          name: icon,
        }),
      ]),
    ]);
  }
}
