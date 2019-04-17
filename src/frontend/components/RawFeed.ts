/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import ShortRawMessage from './messages/ShortRawMessage';
import {Palette} from '../global-styles/palette';
import {GetReadable, MsgAndExtras} from '../drivers/ssb';
import PullFlatList, {PullFlatListProps} from 'pull-flat-list';
import {Msg} from 'ssb-typescript';

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },

  itemSeparator: {
    backgroundColor: Palette.backgroundVoidWeak,
    height: 1,
  },
});

class RawFeedItemSeparator extends PureComponent {
  public render() {
    return h(View, {style: styles.itemSeparator});
  }
}

type Props = {
  getReadable: GetReadable<MsgAndExtras> | null;
  onPressMsg?: (ev: {msg: Msg}) => void;
  style?: any;
};

export default class Feed extends PureComponent<Props, {}> {
  public render() {
    const {style, getReadable, onPressMsg} = this.props;

    return h<PullFlatListProps<MsgAndExtras>>(PullFlatList, {
      getScrollStream: getReadable,
      keyExtractor: (msg: MsgAndExtras, idx: number) => msg.key || String(idx),
      style: [styles.container, style] as any,
      initialNumToRender: 7,
      pullAmount: 2,
      numColumns: 1,
      refreshable: true,
      refreshColors: [Palette.backgroundBrandWeak],
      ItemSeparatorComponent: RawFeedItemSeparator,
      renderItem: ({item}) =>
        h(ShortRawMessage, {
          msg: item,
          name: item.value._$manyverse$metadata.about.name,
          imageUrl: item.value._$manyverse$metadata.about.imageUrl,
          onPress: onPressMsg,
        }),
    });
  }
}
