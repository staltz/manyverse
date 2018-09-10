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

import xs from 'xstream';
import {PureComponent, ReactElement} from 'react';
import {View, StyleSheet, NativeScrollEvent} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, MsgId} from 'ssb-typescript';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import CompactThread from './CompactThread';
import PlaceholderMessage from './messages/PlaceholderMessage';
import {GetReadable, ThreadAndExtras} from '../drivers/ssb';
import PullFlatList from 'pull-flat-list';
import {Stream, Subscription, Listener} from 'xstream';
import {propifyMethods} from 'react-propify-methods';
const pull = require('pull-stream');
const Pushable = require('pull-pushable');
const PullFlatList2 = propifyMethods(
  PullFlatList,
  'scrollToOffset' as any,
  'forceRefresh',
);

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },

  itemSeparator: {
    backgroundColor: Palette.brand.voidBackground,
    height: Dimensions.verticalSpaceNormal,
  },

  footer: {
    alignSelf: 'flex-start',
    marginLeft: Dimensions.horizontalSpaceBig,
    marginTop: Dimensions.verticalSpaceBig,
    marginBottom: Dimensions.verticalSpaceBig,
  },
});

const FeedFooter = h(PlaceholderMessage);

class FeedItemSeparator extends PureComponent {
  public render() {
    return h(View, {style: styles.itemSeparator});
  }
}

type Props = {
  getReadable: GetReadable<ThreadAndExtras> | null;
  getPublicationsReadable?: GetReadable<ThreadAndExtras> | null;
  publication$?: Stream<any> | null;
  scrollToTop$?: Stream<any> | null;
  selfFeedId: FeedId;
  EmptyComponent?: ReactElement<any>;
  style?: any;
  onRefresh?: () => void;
  onPressLike?: (ev: {msgKey: MsgId; like: boolean}) => void;
  onPressReply?: (ev: {msgKey: MsgId; rootKey: MsgId}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressExpandThread?: (ev: {rootMsgId: MsgId}) => void;
};

type State = {
  showPlaceholder: boolean;
};

const Y_OFFSET_IS_AT_TOP = 10;

export default class Feed extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {showPlaceholder: false};
    this.addedThreadsStream = Pushable();
    this.yOffset = 0;

    this._onScroll = (ev: {nativeEvent: NativeScrollEvent}) => {
      if (ev && ev.nativeEvent && ev.nativeEvent.contentOffset) {
        this.yOffset = ev.nativeEvent.contentOffset.y || 0;
      }
    };
  }

  private addedThreadsStream: any | null;
  private yOffset: number;
  private _onScroll: (ev: {nativeEvent: NativeScrollEvent}) => void;
  private subscription?: Subscription;

  public componentDidMount() {
    this.addedThreadsStream = this.addedThreadsStream || Pushable();
    const {publication$} = this.props;
    if (publication$) {
      const listener = {next: this.onPublication.bind(this)};
      this.subscription = publication$.subscribe(listener as Listener<any>);
    }
  }

  public componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = void 0;
    }
    if (this.addedThreadsStream) {
      this.addedThreadsStream.end();
      this.addedThreadsStream = null;
    }
  }

  private onPublication() {
    const {getPublicationsReadable} = this.props;
    if (!getPublicationsReadable) return;
    const readable = getPublicationsReadable({live: true, old: false});
    if (!readable) return;
    const addedThreadsStream = this.addedThreadsStream;
    const that = this;

    that.setState({showPlaceholder: true});
    pull(
      readable,
      pull.take(1),
      pull.drain((thread: ThreadAndExtras) => {
        that.setState({showPlaceholder: false});
        addedThreadsStream.push(thread);
      }),
    );
  }

  public render() {
    const {
      onRefresh,
      onPressLike,
      onPressReply,
      onPressAuthor,
      onPressExpandThread,
      style,
      scrollToTop$,
      getReadable,
      selfFeedId,
      EmptyComponent,
    } = this.props;

    return h(PullFlatList2, {
      getScrollStream: getReadable,
      getPrefixStream: () => this.addedThreadsStream,
      style: [styles.container, style] as any,
      initialNumToRender: 2,
      pullAmount: 1,
      numColumns: 1,
      refreshable: true,
      onRefresh,
      onScroll: this._onScroll,
      scrollToOffset$: (scrollToTop$ || xs.never())
        .filter(() => this.yOffset > Y_OFFSET_IS_AT_TOP)
        .mapTo({offset: 0, animated: true}),
      forceRefresh$: (scrollToTop$ || xs.never())
        .filter(() => this.yOffset <= Y_OFFSET_IS_AT_TOP)
        .mapTo(void 0),
      refreshColors: [Palette.indigo7],
      keyExtractor: (thread: ThreadAndExtras, index: number) =>
        thread.messages[0].key || String(index),
      ItemSeparatorComponent: FeedItemSeparator,
      ListFooterComponent: FeedFooter,
      ListEmptyComponent: EmptyComponent,
      renderItem: ({item}: any) =>
        h(View, [
          h(CompactThread, {
            thread: item as ThreadAndExtras,
            selfFeedId,
            onPressLike,
            onPressReply,
            onPressAuthor,
            onPressExpand: onPressExpandThread || ((x: any) => {}),
          }),
        ]),
    });
  }
}
