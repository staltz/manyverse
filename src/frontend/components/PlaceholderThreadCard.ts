// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {h} from '@cycle/react';
import {Dimensions} from '~frontend/global-styles/dimens';
import MessageContainer from './messages/MessageContainer';
import PlaceholderHeader from './messages/PlaceholderMessageHeader';
import PlaceholderFooter from './messages/PlaceholderMessageFooter';
import ThreadCard from './ThreadCard';

export const styles = StyleSheet.create({
  container: {
    flex: 0,
    height: ThreadCard.HEIGHT,
    minHeight: ThreadCard.HEIGHT,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  body: {
    flex: 1,
    marginTop: Dimensions.verticalSpaceNormal + 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default class PlaceholderThreadCard extends PureComponent<{}> {
  public render() {
    return h(MessageContainer, {style: styles.container}, [
      h(PlaceholderHeader, {key: 'ph'}),
      h(View, {key: 'b', style: styles.body}),
      h(PlaceholderFooter, {key: 'pf'}),
    ]);
  }
}
