/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {PureComponent, ReactElement} from 'react';
import {
  Platform,
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
  isSelected: boolean;
  accessibilityLabel: string;
  iconName: string;
  label: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => {};
  renderIconExtras?: () => ReactElement<any>;
}> {
  public render() {
    const {
      isSelected,
      accessibilityLabel,
      style,
      iconName,
      renderIconExtras,
      label,
      onPress,
    } = this.props;

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
        h(View, {style: [styles.tabButton, style], pointerEvents: 'box-only'}, [
          h(View, [
            h(Icon, {
              name: iconName,
              ...(isSelected ? iconProps.tabSelected : iconProps.tab),
            }),
            renderIconExtras?.(),
          ]),

          h(
            Text,
            {
              style: isSelected
                ? styles.tabButtonTextSelected
                : styles.tabButtonText,
              numberOfLines: 1,
            },
            label,
          ),
        ]),
      ],
    );
  }
}
