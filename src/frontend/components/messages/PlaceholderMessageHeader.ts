// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {IconNames} from '~frontend/global-styles/icons';
import MessageHeader from './MessageHeader';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: MessageHeader.HEIGHT,
    minHeight: MessageHeader.HEIGHT,
    flex: 0,
    flexBasis: 'auto',
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: 0,
  },

  authorAvatar: {
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Math.ceil(Dimensions.avatarSizeNormal * 0.5),
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
    marginRight: Dimensions.horizontalSpaceSmall + 2,
  },

  authorNameTouchable: {
    flex: 1,
  },

  authorName: {
    width: 110,
    height: 16,
    minHeight: 16,
    marginTop: 2,
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
  },

  timestamp: {
    width: 90,
    height: 16,
    minHeight: 16,
    marginTop: 2,
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
  },

  buttonArea: {
    maxWidth: 36,
    maxHeight: 36,
    borderRadius: 18,
    marginRight: Dimensions.horizontalSpaceSmall,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const iconColor = Palette.isDarkTheme ? Palette.voidStrong : Palette.voidMain;

export default class PlaceholderHeader extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.container}, [
      h(View, {key: 'a', style: styles.authorAvatar}),
      h(View, {key: 'b', style: styles.authorNameTouchable}, [
        h(View, {key: 'b1', style: styles.authorName}),
        h(View, {key: 'b2', style: styles.timestamp}),
      ]),
      h(View, {key: 'c', style: styles.buttonArea}, [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: iconColor,
          name: IconNames.etcDropdown,
        }),
      ]),
    ]);
  }
}
