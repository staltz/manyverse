/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {Dimensions} from '../global-styles/dimens';
import MessageContainer from './messages/MessageContainer';
import PlaceholderHeader from './messages/PlaceholderMessageHeader';
import PlaceholderFooter from './messages/PlaceholderMessageFooter';
import ThreadCard from './ThreadCard';

export const styles = StyleSheet.create({
  container: {
    flex: 0,
    height: ThreadCard.HEIGHT,
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
