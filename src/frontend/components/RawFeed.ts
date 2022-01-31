// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {PureComponent} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Msg} from 'ssb-typescript';
import PullFlatList, {PullFlatListProps} from 'pull-flat-list';
import {t} from '../drivers/localization';
import {GetReadable} from '../drivers/ssb';
import {MsgAndExtras} from '../ssb/types';
import {displayName} from '../ssb/utils/from-ssb';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import ShortRawMessage from './messages/ShortRawMessage';
import AnimatedLoading from './AnimatedLoading';

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
    ...Platform.select({
      web: {
        maxWidth: `calc(100vw - ${Dimensions.desktopSideWidth.px})`,
      },
    }),
  },

  itemSeparator: {
    backgroundColor: Palette.voidWeak,
    height: 1,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },
});

class RawFeedItemSeparator extends PureComponent {
  public render() {
    return h(View, {style: styles.itemSeparator});
  }
}

interface Props {
  getReadable: GetReadable<MsgAndExtras> | null;
  onPressMsg?: (msg: Msg) => void;
  style?: any;
}

interface State {
  initialLoading: boolean;
}

export default class RawFeed extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {initialLoading: true};
  }

  private _onFeedInitialPullDone = () => {
    this.setState({initialLoading: false});
  };

  public render() {
    const {style, getReadable, onPressMsg} = this.props;
    const {initialLoading} = this.state;

    return h<PullFlatListProps<MsgAndExtras>>(PullFlatList, {
      getScrollStream: getReadable,
      keyExtractor: (msg: MsgAndExtras, idx: number) => msg.key ?? String(idx),
      style: [styles.container, style],
      initialNumToRender: 14,
      pullAmount: 2,
      numColumns: 1,
      refreshable: true,
      onEndReachedThreshold: 3,
      refreshColors: [Palette.brandWeak],
      ItemSeparatorComponent: RawFeedItemSeparator,
      onInitialPullDone: this._onFeedInitialPullDone,
      ListFooterComponent: initialLoading
        ? h(AnimatedLoading, {text: t('central.loading')})
        : null,
      renderItem: ({item}) =>
        h(ShortRawMessage, {
          msg: item,
          name: displayName(
            item.value._$manyverse$metadata.about.name,
            item.value.author,
          ),
          imageUrl: item.value._$manyverse$metadata.about.imageUrl,
          onPress: onPressMsg,
        }),
    });
  }
}
