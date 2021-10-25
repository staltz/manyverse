// SPDX-FileCopyrightText: 2020-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import MessageFooter from './MessageFooter';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: MessageFooter.HEIGHT,
    minHeight: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },

  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 2,
  },

  buttonsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
    flex: 3,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },

  buttonArea: {
    ...Platform.select({
      web: {
        width: '80px',
        cursor: 'default',
      },
      default: {
        flex: 1,
      },
    }),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonIcon: {
    height: Dimensions.iconSizeNormal,
    width: Dimensions.iconSizeNormal,
    borderRadius: 6,
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
  },
});

const iconColor = Palette.isDarkTheme ? Palette.voidStrong : Palette.voidMain;

export default class PlaceholderFooter extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.container}, [
      h(View, {key: 'a', style: styles.reactionsContainer}),
      h(View, {key: 'b', style: styles.buttonsContainer}, [
        h(View, {key: 'x', style: styles.buttonArea}, [
          h(Icon, {
            size: Dimensions.iconSizeSmall,
            color: iconColor,
            name: 'emoticon-happy-outline',
          }),
        ]),
        h(View, {key: 'y', style: styles.buttonArea}, [
          h(Icon, {
            size: Dimensions.iconSizeSmall,
            color: iconColor,
            name: 'comment-outline',
          }),
        ]),
        h(View, {key: 'z', style: styles.buttonArea}, [
          h(Icon, {
            size: Dimensions.iconSizeNormal,
            color: iconColor,
            name: 'dots-horizontal',
          }),
        ]),
      ]),
    ]);
  }
}
