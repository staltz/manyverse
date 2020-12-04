/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {t} from '../drivers/localization';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import HeaderButton from './HeaderButton';

const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.brandMain,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  title: {
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeLarge,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: getStatusBarHeight() + Dimensions.verticalSpaceIOSTitle,
        left: 40,
        right: 40,
        textAlign: 'center',
        marginLeft: 0,
      },
      default: {
        marginLeft: Dimensions.horizontalSpaceLarge,
      },
    }),
  },

  rightSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export type Props = {
  title?: string;
  onPressBack?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default class TopBar extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const {title, onPressBack, style} = this.props;
    return $(View, {style: [styles.container, style]}, [
      $(HeaderButton, {
        key: 'back',
        onPress: onPressBack,
        icon: Platform.select({ios: 'chevron-left', default: 'arrow-left'}),
        ...Platform.select({ios: {iconSize: Dimensions.iconSizeLarge}}),
        accessibilityLabel: t('call_to_action.go_back.accessibility_label'),
      }),
      title ? $(Text, {key: 'title', style: styles.title}, title) : null,
      this.props.children
        ? $(View, {key: 'right', style: styles.rightSide}, this.props.children)
        : null,
    ]);
  }
}
