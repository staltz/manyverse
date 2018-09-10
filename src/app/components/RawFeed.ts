/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {PureComponent} from 'react';
import {View, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import ShortRawMessage from './messages/ShortRawMessage';
import {Palette} from '../global-styles/palette';
import {GetReadable, MsgAndExtras} from '../drivers/ssb';
import PullFlatList, {PullFlatListProps} from 'pull-flat-list';
import {withMutantProps} from 'react-mutant-hoc';
import {Msg} from 'ssb-typescript';

const ShortRawMessageM = withMutantProps(ShortRawMessage, 'name', 'imageUrl');

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },

  itemSeparator: {
    backgroundColor: Palette.brand.voidBackground,
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
      pullAmount: 6,
      numColumns: 1,
      refreshable: true,
      refreshColors: [Palette.indigo7],
      ItemSeparatorComponent: RawFeedItemSeparator,
      renderItem: ({item}) =>
        h(ShortRawMessageM, {
          msg: item,
          name: item.value._streams.about.name,
          imageUrl: item.value._streams.about.imageUrl,
          onPress: onPressMsg,
        }),
    });
  }
}
