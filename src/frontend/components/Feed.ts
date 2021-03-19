/* Copyright (C) 2018-2021 The Manyverse Authors.
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
import {Stream, Subscription} from 'xstream';
import {propifyMethods} from 'react-propify-methods';
import PullFlatList from 'pull-flat-list';
import {t} from '../drivers/localization';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import {getBreathingComposition} from '../global-styles/animations';
import {GetReadable} from '../drivers/ssb';
import {
  ThreadSummaryWithExtras,
  PressReactionsEvent,
  PressAddReactionEvent,
  MsgAndExtras,
} from '../ssb/types';
import ThreadCard from './ThreadCard';
import PlaceholderThreadCard from './PlaceholderThreadCard';
import FollowCard from './FollowCard';

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
    backgroundColor: Palette.voidMain,
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
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textVeryWeak,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

function Separator() {
  return h(View, {style: styles.itemSeparator});
}

class InitialLoading extends PureComponent<any> {
  private loadingAnim = new Animated.Value(0);
  private indexesAnim = new Animated.Value(0);

  public componentDidMount() {
    // Breathing animation
    getBreathingComposition(this.loadingAnim).start();

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
  prePublication$: Stream<any> | null;
  postPublication$: Stream<ThreadSummaryWithExtras> | null;
  scrollToTop$?: Stream<any> | null;
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  EmptyComponent?: ReactElement<any>;
  HeaderComponent?: ReactElement<any>;
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
  private yOffset: number;
  private addedThreadsStream?: {push: (x: any) => {}; end: () => {}};
  private preSubscription?: Subscription;
  private postSubscription?: Subscription;
  private latestPublicationTimestamp: number;

  constructor(props: Props) {
    super(props);
    this.yOffset = 0;
    this.latestPublicationTimestamp = 0;
    this.addedThreadsStream = Pushable();
    this.state = {showPlaceholder: false, initialLoading: true};
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
    this.addedThreadsStream ??= Pushable();

    const {prePublication$, postPublication$} = this.props;
    if (prePublication$ && postPublication$) {
      this.preSubscription = prePublication$.subscribe({
        next: () => {
          // Prevent possible race condition in case ssb-db2 publish is fast
          if (Date.now() > this.latestPublicationTimestamp + 200) {
            this.setState({showPlaceholder: true});
          }
        },
      });

      this.postSubscription = postPublication$.subscribe({
        next: (thread) => {
          this.setState({showPlaceholder: false});
          this.addedThreadsStream?.push(thread);
          this.latestPublicationTimestamp = Date.now();
        },
      });
    }
  }

  public componentWillUnmount() {
    this.preSubscription?.unsubscribe();
    this.preSubscription = void 0;

    this.postSubscription?.unsubscribe();
    this.postSubscription = void 0;

    this.addedThreadsStream?.end();
    this.addedThreadsStream = void 0;
  }

  public renderHeader() {
    const {showPlaceholder} = this.state;
    const {HeaderComponent} = this.props;

    if (showPlaceholder && HeaderComponent) {
      return h(View, [
        HeaderComponent,
        h(Separator),
        h(PlaceholderThreadCard),
        h(Separator),
      ]);
    } else if (showPlaceholder) {
      return h(View, [h(PlaceholderThreadCard), h(Separator)]);
    } else if (HeaderComponent) {
      return h(View, [HeaderComponent, h(Separator)]);
    } else {
      return null;
    }
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
      lastSessionTimestamp,
      selfFeedId,
      EmptyComponent,
    } = this.props;
    const {initialLoading} = this.state;

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
      refreshColors: [Palette.brandWeak],
      keyExtractor: (thread: ThreadSummaryWithExtras, index: number) =>
        thread.root.key ?? String(index),
      ListHeaderComponent: this.renderHeader(),
      ListFooterComponent: initialLoading
        ? InitialLoading
        : PlaceholderThreadCard,
      ListEmptyComponent: EmptyComponent,
      renderItem: ({item}: any) => {
        const thread = item as ThreadSummaryWithExtras;
        if (thread?.root?.value?.content?.type === 'contact') {
          return h(View, [
            h(FollowCard, {
              thread,
              lastSessionTimestamp,
              selfFeedId,
              onPressReactions,
              onPressAddReaction,
              onPressAuthor,
              onPressEtc,
              onPressExpand,
            }),
            h(Separator),
          ]);
        } else {
          return h(View, [
            h(ThreadCard, {
              thread,
              lastSessionTimestamp,
              selfFeedId,
              onPressReactions,
              onPressAddReaction,
              onPressAuthor,
              onPressEtc,
              onPressExpand,
              onPressExpandCW,
            }),
            h(Separator),
          ]);
        }
      },
    });
  }
}
