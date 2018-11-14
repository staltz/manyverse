/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {PureComponent, ReactElement} from 'react';
import {View, StyleSheet, NativeScrollEvent} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
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
  onPressEtc?: (msg: Msg) => void;
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
      onPressEtc,
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
      initialNumToRender: 1,
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
            onPressEtc,
            onPressExpand: onPressExpandThread || ((x: any) => {}),
          }),
          h(View, {style: styles.itemSeparator}),
        ]),
    });
  }
}
