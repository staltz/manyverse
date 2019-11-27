/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs from 'xstream';
import {PureComponent, ReactElement} from 'react';
import {
  View,
  StyleSheet,
  NativeScrollEvent,
  Animated,
  Easing,
} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import CompactThread from './CompactThread';
import PlaceholderMessage from './messages/PlaceholderMessage';
import {GetReadable, ThreadAndExtras} from '../drivers/ssb';
import {Likes} from '../ssb/types';
import PullFlatList from 'pull-flat-list';
import {Stream, Subscription, Listener} from 'xstream';
import {propifyMethods} from 'react-propify-methods';
import {Typography} from '../global-styles/typography';
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
    backgroundColor: Palette.backgroundVoid,
    height: Dimensions.verticalSpaceNormal,
  },

  footer: {
    alignSelf: 'flex-start',
    marginLeft: Dimensions.horizontalSpaceBig,
    marginTop: Dimensions.verticalSpaceBig,
    marginBottom: Dimensions.verticalSpaceBig,
  },

  initialLoading: {
    marginTop: Dimensions.verticalSpaceNormal,
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textVeryWeak,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

function Separator() {
  return h(View, {style: styles.itemSeparator});
}

function PlaceholderWithSeparator() {
  return h(View, [h(PlaceholderMessage), h(Separator)]);
}

class InitialLoading extends PureComponent<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      fadeAnim: new Animated.Value(0),
    };
  }

  public componentDidMount() {
    Animated.sequence([
      Animated.delay(8000),
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(this.state.fadeAnim, {
            toValue: 0.6,
            duration: 2100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(this.state.fadeAnim, {
            toValue: 1,
            easing: Easing.linear,
            duration: 2400,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();
  }

  public render() {
    const {fadeAnim} = this.state;

    return h(View, [
      h(PlaceholderMessage),
      h(
        Animated.Text,
        {selectable: true, style: [styles.initialLoading, {opacity: fadeAnim}]},
        'Building database indexes...\nThis may take up to several minutes',
      ),
    ]);
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
  onInitialPullDone?: () => void;
  onRefresh?: () => void;
  onPressLikeCount?: (ev: {msgKey: MsgId; likes: Likes}) => void;
  onPressLike?: (ev: {msgKey: MsgId; like: boolean}) => void;
  onPressReply?: (ev: {msgKey: MsgId; rootKey: MsgId}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressExpandThread?: (ev: {rootMsgId: MsgId}) => void;
};

type State = {
  showPlaceholder: boolean;
  initialLoading: boolean;
};

const Y_OFFSET_IS_AT_TOP = 10;

export default class Feed extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {showPlaceholder: false, initialLoading: true};
    this.addedThreadsStream = Pushable();
    this.yOffset = 0;

    this._onScroll = (ev: {nativeEvent: NativeScrollEvent}) => {
      if (ev?.nativeEvent?.contentOffset) {
        this.yOffset = ev.nativeEvent.contentOffset.y ?? 0;
      }
    };
    this._onFeedInitialPullDone = () => {
      if (this.props.onInitialPullDone) this.props.onInitialPullDone();
      this.setState({initialLoading: false});
    };
  }

  private addedThreadsStream: any | null;
  private yOffset: number;
  private _onScroll: (ev: {nativeEvent: NativeScrollEvent}) => void;
  private _onFeedInitialPullDone: () => void;
  private subscription?: Subscription;

  public componentDidMount() {
    this.addedThreadsStream = this.addedThreadsStream ?? Pushable();
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
      onPressLikeCount,
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
    const {showPlaceholder, initialLoading} = this.state;

    return h(PullFlatList2, {
      getScrollStream: getReadable,
      getPrefixStream: () => this.addedThreadsStream,
      style: [styles.container, style],
      initialNumToRender: 1,
      pullAmount: 1,
      numColumns: 1,
      refreshable: true,
      onInitialPullDone: this._onFeedInitialPullDone,
      onRefresh,
      onScroll: this._onScroll,
      scrollToOffset$: (scrollToTop$ ?? xs.never())
        .filter(() => this.yOffset > Y_OFFSET_IS_AT_TOP)
        .mapTo({offset: 0, animated: true}),
      forceRefresh$: (scrollToTop$ ?? xs.never())
        .filter(() => this.yOffset <= Y_OFFSET_IS_AT_TOP)
        .mapTo(void 0),
      refreshColors: [Palette.backgroundBrandWeak],
      keyExtractor: (thread: ThreadAndExtras, index: number) =>
        thread.messages[0].key ?? String(index),
      ListHeaderComponent: showPlaceholder ? PlaceholderWithSeparator : null,
      ListFooterComponent: initialLoading ? InitialLoading : PlaceholderMessage,
      ListEmptyComponent: EmptyComponent,
      renderItem: ({item}: any) =>
        h(View, [
          h(CompactThread, {
            thread: item as ThreadAndExtras,
            selfFeedId,
            onPressLikeCount,
            onPressLike,
            onPressReply,
            onPressAuthor,
            onPressEtc,
            onPressExpand: onPressExpandThread ?? (() => {}),
          }),
          h(Separator),
        ]),
    });
  }
}
