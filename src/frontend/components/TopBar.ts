/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import HeaderButton from './HeaderButton';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';

const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundBrand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  title: {
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeLarge,
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
});

export type Props = {
  title?: string;
  onPressBack?: () => void;
};

export default class TopBar extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    const {title, onPressBack} = this.props;
    return $(View, {style: styles.container}, [
      $(HeaderButton, {
        onPress: onPressBack,
        icon: Platform.select({ios: 'chevron-left', default: 'arrow-left'}),
        ...Platform.select({ios: {iconSize: Dimensions.iconSizeLarge}}),
        accessibilityLabel: 'Back Button',
      }),
      title ? $(Text, {style: styles.title}, title) : null,
    ]);
  }
}
