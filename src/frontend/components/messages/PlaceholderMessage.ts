// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import MessageContainer from './MessageContainer';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import PlaceholderHeader from './PlaceholderMessageHeader';
import PlaceholderFooter from './PlaceholderMessageFooter';

export const styles = StyleSheet.create({
  container: {
    marginTop: Dimensions.verticalSpaceNormal,
  },

  body: {
    width: 250,
    height: 16,
    marginTop: Dimensions.verticalSpaceNormal + 2,
    marginBottom: 10,
    backgroundColor: Palette.isDarkTheme
      ? Palette.voidStronger
      : Palette.voidWeak,
  },
});

export default class PlaceholderMessage extends PureComponent<{}> {
  public render() {
    return h(MessageContainer, {style: styles.container}, [
      h(PlaceholderHeader, {key: 'ph'}),
      h(View, {key: 'b', style: styles.body}),
      h(PlaceholderFooter, {key: 'pf'}),
    ]);
  }
}
