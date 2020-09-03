/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement as $} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  unread: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Palette.backgroundBrandWeakest,
  },
});

type Props = {
  style?: any;
  unreadOpacity?: Animated.Value;
};

export default class MessageContainer extends PureComponent<Props> {
  public render() {
    const {style, children, unreadOpacity} = this.props;
    if (unreadOpacity) {
      return $(View, {style: [styles.card, style]}, [
        $(Animated.View, {style: [styles.unread, {opacity: unreadOpacity}]}),
        children,
      ]);
    } else {
      return $(View, {style: [styles.card, style]}, children);
    }
  }
}
