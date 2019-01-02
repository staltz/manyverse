/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent, createElement} from 'react';
import {View, StyleSheet} from 'react-native';
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
  },
});

type Props = {
  style?: any;
};

export default class MessageContainer extends PureComponent<Props> {
  public render() {
    return createElement(
      View,
      {style: [styles.card, this.props.style]},
      this.props.children,
    );
  }
}
