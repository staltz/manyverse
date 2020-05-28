/* Copyright (C) 2018-2020 The Manyverse Authors.
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
  ViewStyle,
} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';
import {Stream, Subscription, Listener} from 'xstream';
import {propifyMethods} from 'react-propify-methods';
import PullFlatList from 'pull-flat-list';
import {t} from '../drivers/localization';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import {GetReadable} from '../drivers/ssb';
import {
  ThreadSummaryWithExtras,
  PressReactionsEvent,
  PressAddReactionEvent,
  MsgAndExtras,
} from '../ssb/types';
import ThreadCard from './ThreadCard';
import PlaceholderThreadCard from './PlaceholderThreadCard';

const pull = require('pull-stream');
const Pushable = require('pull-pushable');
const PullFlatList2 = propifyMethods(
  PullFlatList,
  'scrollToOffset' as any,
  'forceRefresh',
);

const SEPARATOR_HEIGHT = Dimensions.verticalSpaceNormal;
const Y_OFFSET_IS_AT_TOP = 10;

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },

  itemSeparator: {
    backgroundColor: Palette.backgroundVoid,
    height: SEPARATOR_HEIGHT,
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
  return h(View, [h(PlaceholderThreadCard), h(Separator)]);
}

class InitialLoading extends PureComponent<any> {
  private loadingAnim = new Animated.Value(0);
  private indexesAnim = new Animated.Value(0);

  public componentDidMount() {
    // Breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.loadingAnim, {
          toValue: 0.6,
          duration: 2100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(this.loadingAnim, {
          toValue: 1,
          easing: Easing.linear,
          duration: 2400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Wait for 10 seconds before starting animation
    Animated.sequence([
      Animated.delay(10000),
      // Take 4 seconds to slowly appear
      Animated.timing(this.indexesAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
      // Breathing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(this.indexesAnim, {
            toValue: 0.6,
            duration: 2100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(this.indexesAnim, {
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
    return h(View, [
      h(PlaceholderThreadCard),
      h(
        Animated.Text,
        {style: [styles.initialLoading, {opacity: this.loadingAnim}]},
        t('central.loading'),
      ),
      h(
        Animated.Text,
        {
          selectable: true,
          style: [styles.initialLoading, {opacity: this.indexesAnim}],
        },
        t('central.building_indexes'),
      ),
    ]);
  }
}

type Props = {
  getReadable: GetReadable<ThreadSummaryWithExtras> | null;
  getPublicationsReadable?: GetReadable<ThreadSummaryWithExtras> | null;
  publication$?: Stream<any> | null;
  scrollToTop$?: Stream<any> | null;
  selfFeedId: FeedId;
  EmptyComponent?: ReactElement<any>;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  progressViewOffset?: number;
  onInitialPullDone?: () => void;
  onRefresh?: () => void;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressExpand?: (msg: MsgAndExtras) => void;
  onPressExpandCW?: (msg: MsgAndExtras) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  yOffsetAnimVal?: Animated.Value;
};

type State = {
  showPlaceholder: boolean;
  initialLoading: boolean;
};

export default class Feed extends PureComponent<Props, State> {
  private addedThreadsStream: any | null;
  private yOffset: number;
  private subscription?: Subscription;

  constructor(props: Props) {
    super(props);
    this.state = {showPlaceholder: false, initialLoading: true};
    this.addedThreadsStream = Pushable();
    this.yOffset = 0;
  }

  private _onScroll = (ev: {nativeEvent: NativeScrollEvent}) => {
    if (ev?.nativeEvent?.contentOffset) {
      this.yOffset = ev.nativeEvent.contentOffset.y ?? 0;
    }
  };

  private _onFeedInitialPullDone = () => {
    if (this.props.onInitialPullDone) this.props.onInitialPullDone();
    this.setState({initialLoading: false});
  };

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
      pull.drain((thread: ThreadSummaryWithExtras) => {
        that.setState({showPlaceholder: false});
        addedThreadsStream.push(thread);
      }),
    );
  }

  public render() {
    const {
      onRefresh,
      onPressReactions,
      onPressAddReaction,
      onPressAuthor,
      onPressEtc,
      onPressExpand,
      onPressExpandCW,
      style,
      contentContainerStyle,
      progressViewOffset,
      yOffsetAnimVal,
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
      contentContainerStyle,
      keyboardDismissMode: 'on-drag',
      initialNumToRender: 1,
      progressViewOffset: progressViewOffset ?? 0,
      scrollEventThrottle: 1,
      pullAmount: 1,
      numColumns: 1,
      onEndReachedThreshold: 6,
      refreshable: true,
      onInitialPullDone: this._onFeedInitialPullDone,
      onRefresh,
      onScroll: yOffsetAnimVal
        ? Animated.event(
            [{nativeEvent: {contentOffset: {y: yOffsetAnimVal}}}],
            {
              useNativeDriver: true,
              listener: this._onScroll,
            },
          )
        : this._onScroll,
      scrollToOffset$: (scrollToTop$ ?? xs.never())
        .filter(() => this.yOffset > Y_OFFSET_IS_AT_TOP)
        .mapTo({offset: 0, animated: true}),
      forceRefresh$: (scrollToTop$ ?? xs.never())
        .filter(() => this.yOffset <= Y_OFFSET_IS_AT_TOP)
        .mapTo(void 0),
      refreshColors: [Palette.backgroundBrandWeak],
      keyExtractor: (thread: ThreadSummaryWithExtras, index: number) =>
        thread.root.key ?? String(index),
      ListHeaderComponent: showPlaceholder ? PlaceholderWithSeparator : null,
      ListFooterComponent: initialLoading
        ? InitialLoading
        : PlaceholderThreadCard,
      ListEmptyComponent: EmptyComponent,
      renderItem: ({item}: any) =>
        h(View, [
          h(ThreadCard, {
            thread: item as ThreadSummaryWithExtras,
            selfFeedId,
            onPressReactions,
            onPressAddReaction,
            onPressAuthor,
            onPressEtc,
            onPressExpand,
            onPressExpandCW,
          }),
          h(Separator),
        ]),
    });
  }
}
