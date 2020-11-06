/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import MessageFooter from './MessageFooter';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    height: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },

  reactionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 2,
  },

  buttonsContainer: {
    borderTopWidth: 1,
    borderTopColor: Palette.textLine,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flex: 3,
  },

  buttonArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonIcon: {
    height: Dimensions.iconSizeNormal,
    width: Dimensions.iconSizeNormal,
    borderRadius: 6,
    backgroundColor: Palette.voidWeak,
  },
});

export default class PlaceholderFooter extends PureComponent<{}> {
  public render() {
    return h(View, {style: styles.container}, [
      h(View, {key: 'a', style: styles.reactionsContainer}),
      h(View, {key: 'b', style: styles.buttonsContainer}, [
        h(View, {key: 'x', style: styles.buttonArea}, [
          h(View, {style: styles.buttonIcon}),
        ]),
        h(View, {key: 'y', style: styles.buttonArea}, [
          h(View, {style: styles.buttonIcon}),
        ]),
        h(View, {key: 'z', style: styles.buttonArea}, [
          h(View, {style: styles.buttonIcon}),
        ]),
      ]),
    ]);
  }
}
