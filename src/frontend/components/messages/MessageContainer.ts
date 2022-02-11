// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent, createElement as $} from 'react';
import {View, StyleSheet, ViewStyle, Platform} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';

const card: ViewStyle = {
  flex: 1,
  paddingHorizontal: Dimensions.horizontalSpaceBig,
  paddingVertical: Dimensions.verticalSpaceBig,
  marginBottom: 1,
  flexDirection: 'column',
  alignItems: 'stretch',
  ...Platform.select({
    web: {
      width: Dimensions.desktopMiddleWidth.px,
    },
  }),
};

export const styles = StyleSheet.create({
  readCard: {
    ...card,
    backgroundColor: Palette.backgroundText,
  },

  unreadCard: {
    ...card,
    backgroundColor: Palette.backgroundTextBrand,
  },
});

interface Props {
  style?: any;
  unread?: boolean;
}

export default class MessageContainer extends PureComponent<Props> {
  public render() {
    const {style, children, unread} = this.props;
    return $(
      View,
      {style: [unread ? styles.unreadCard : styles.readCard, style]},
      children,
    );
  }
}
