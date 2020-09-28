/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';

const card: ViewStyle = {
  flex: 1,
  paddingHorizontal: Dimensions.horizontalSpaceBig,
  paddingVertical: Dimensions.verticalSpaceBig,
  marginBottom: 1,
  flexDirection: 'column',
  alignItems: 'stretch',
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

type Props = {
  style?: any;
  unread?: boolean;
};

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
