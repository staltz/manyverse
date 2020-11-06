/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {View, StyleSheet, Appearance} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import MessageHeader from './MessageHeader';

const colorScheme = Appearance.getColorScheme();

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: MessageHeader.HEIGHT,
    flex: 0,
    marginBottom: 0,
  },

  authorAvatar: {
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Math.ceil(Dimensions.avatarSizeNormal * 0.5),
    backgroundColor: colorScheme === 'dark' ? Palette.voidStronger : Palette.voidWeak,
    marginRight: Dimensions.horizontalSpaceSmall + 2,
  },

  authorNameTouchable: {
    flex: 1,
  },

  authorName: {
    width: 110,
    height: 16,
    marginTop: 2,
    backgroundColor: colorScheme === 'dark' ? Palette.voidStronger : Palette.voidWeak,
  },

  timestamp: {
    width: 100,
    height: 16,
    marginTop: 2,
    backgroundColor: colorScheme === 'dark' ? Palette.voidStronger : Palette.voidWeak,
  },
});

export default class PlaceholderHeader extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.container}, [
      h(View, {key: 'a', style: styles.authorAvatar}),
      h(View, {key: 'b', style: styles.authorNameTouchable}, [
        h(View, {style: styles.authorName}),
      ]),
      h(View, {key: 'c', style: styles.timestamp}),
    ]);
  }
}
