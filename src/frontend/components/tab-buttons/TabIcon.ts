// SPDX-FileCopyrightText: 2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {PureComponent, ReactElement} from 'react';
import {
  Platform,
  Pressable,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const {isIPhoneWithMonobrow} = require('react-native-status-bar-height');
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

const styles = StyleSheet.create({
  tabButton: {
    flex: Platform.select({default: 1, web: undefined}),
    flexDirection: Platform.select({default: 'column', web: 'row'}),
    justifyContent: Platform.select({default: 'center', web: 'flex-start'}),
    alignItems: 'center',
    marginTop: Platform.select({ios: isIPhoneWithMonobrow() ? -5 : 0}),
    ...Platform.select({
      web: {
        paddingHorizontal: Dimensions.horizontalSpaceNormal,
        paddingVertical: Dimensions.verticalSpaceSmall,
      },
    }),
  },

  tabHoveredOnDesktop: {
    backgroundColor: Palette.backgroundText,
    borderRadius: Dimensions.borderRadiusFull,
  },

  tabButtonText: {
    marginLeft: Platform.select({web: Dimensions.horizontalSpaceSmall}),
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    fontWeight: Platform.select({web: 'bold'}),
  },

  tabButtonTextSelected: {
    marginLeft: Platform.select({web: Dimensions.horizontalSpaceSmall}),
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textBrand,
    fontWeight: 'bold',
  },
});

const iconProps = {
  tab: {
    size: Dimensions.iconSizeNormal,
    color: Platform.select({
      default: Palette.textVeryWeak,
      web: Palette.textWeak,
    }),
  },

  tabSelected: {
    size: Dimensions.iconSizeNormal,
    color: Palette.textBrand,
  },
};

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const touchableProps: any = {};
if (Platform.OS === 'android') {
  touchableProps.background = TouchableNativeFeedback.SelectableBackground();
}

export default class TabIcon extends PureComponent<{
  isSelected?: boolean;
  accessibilityLabel: string;
  iconName: string;
  label: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => {};
  renderIconExtras?: (visualState?: any) => ReactElement<any> | null;
}> {
  private renderInternals(visualState?: any) {
    const {isSelected, iconName, renderIconExtras, label} = this.props;

    const textStyle = isSelected
      ? styles.tabButtonTextSelected
      : styles.tabButtonText;

    return [
      h(View, {key: 'a'}, [
        h(Icon, {
          key: 'x',
          name: iconName,
          ...(isSelected ? iconProps.tabSelected : iconProps.tab),
        }),
        renderIconExtras?.(visualState),
      ]),
      h(
        Text,
        {key: 'b', style: textStyle, numberOfLines: 1, selectable: false},
        label,
      ),
    ];
  }

  private renderDesktop() {
    const {onPress, style, accessibilityLabel} = this.props;

    return h(Pressable, {
      onPress,
      children: (visualState: any) => [
        h(
          View,
          {key: 'r', style: styles.tabButton},
          this.renderInternals(visualState),
        ),
      ],
      style: ({hovered}: any) => [
        hovered ? styles.tabHoveredOnDesktop : null,
        style,
      ],
      accessible: true,
      accessibilityRole: 'menuitem',
      accessibilityLabel,
    });
  }

  private renderMobile() {
    const {onPress, style, accessibilityLabel} = this.props;

    return h(
      Touchable,
      {
        ...touchableProps,
        onPress,
        style: [styles.tabButton, style], // iOS needs this
        accessible: true,
        accessibilityRole: 'tab',
        accessibilityLabel,
      },
      [
        h(
          View,
          {style: [styles.tabButton, style], pointerEvents: 'box-only'},
          this.renderInternals(),
        ),
      ],
    );
  }

  public render() {
    if (Platform.OS === 'web') {
      return this.renderDesktop();
    } else {
      return this.renderMobile();
    }
  }
}
