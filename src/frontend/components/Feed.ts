// SPDX-FileCopyrightText: 2018-2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs from 'xstream';
import {PureComponent, ReactElement} from 'react';
import {
  View,
  StyleSheet,
  NativeScrollEvent,
  Animated,
  ViewStyle,
  Platform,
} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';
import {Stream, Subscription} from 'xstream';
import {propifyMethods} from 'react-propify-methods';
import PullFlatList from 'pull-flat-list';
const Pushable = require('pull-pushable');
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {GetReadable} from '~frontend/drivers/ssb';
import {
  ThreadSummaryWithExtras,
  PressReactionsEvent,
  PressAddReactionEvent,
  MsgAndExtras,
} from '~frontend/ssb/types';
import ThreadCard from './ThreadCard';
import PlaceholderThreadCard from './PlaceholderThreadCard';
import FollowCard from './FollowCard';
import AnimatedLoading from './AnimatedLoading';
import GatheringCard from './GatheringCard';

const PullFlatList2 = propifyMethods(
  PullFlatList,
  'scrollToOffset' as any,
  'forceRefresh',
);

const Y_OFFSET_IS_AT_TOP = 10;
const SEPARATOR_HEIGHT =
  Platform.OS === 'web'
    ? Dimensions.verticalSpaceLarge
    : Dimensions.verticalSpaceNormal;

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },

  itemContainer: Platform.select({
    web: {
      maxWidth: `calc(100vw - ${Dimensions.desktopMiddleWidth.px})`,
    },
    default: {},
  }),

  itemSeparator: {
    backgroundColor: Palette.voidMain,
    height: SEPARATOR_HEIGHT,
    minHeight: SEPARATOR_HEIGHT,
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
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },
});

function Separator() {
  return h(View, {style: styles.itemSeparator});
}

interface Props {
  /**
   * The main pull-stream of thread objects that determines the content of the
   * feed.
   */
  getReadable: GetReadable<ThreadSummaryWithExtras> | null;

  /**
   * A stream where its events should trigger the appearance of a placeholder
   * thread card, usually just after the user has published a new thread but
   * before it has been received by the database.
   */
  prePublication$: Stream<any> | null;

  /**
   * A stream where its events are new threads authored by the user and just now
   * have been received by the database, and should trigger the disappearance of
   * the placeholder thread, replaced by the new thread rendered in the feed.
   */
  postPublication$: Stream<ThreadSummaryWithExtras> | null;

  scrollToTop$?: Stream<any> | null;
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
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
  onPressExpandReplies?: (msg: MsgAndExtras) => void;
  onPressExpandCW?: (msg: MsgAndExtras) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressTimestamp?: (timestamp: number) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressShare?: (msg: Msg) => void;
  yOffsetAnimVal?: Animated.Value;
}

interface State {
  showPlaceholder: boolean;
  initialLoading: boolean;
}

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

  private renderFooter = () => {
    if (this.state.initialLoading) {
      return h(View, [
        h(PlaceholderThreadCard),
        h(AnimatedLoading, {text: t('central.loading')}),
      ]);
    } else {
      return h(PlaceholderThreadCard);
    }
  };

  private getPrefixStream = () => {
    return this.addedThreadsStream;
  };

  private getOnScroll = () => {
    const {yOffsetAnimVal} = this.props;
    if (yOffsetAnimVal) {
      const hacked = yOffsetAnimVal as Animated.Value & {_animEvent: any};
      if (!hacked._animEvent) {
        hacked._animEvent = Animated.event(
          [{nativeEvent: {contentOffset: {y: hacked}}}],
          {
            useNativeDriver: true,
            listener: this._onScroll,
          },
        );
      }
      return hacked._animEvent;
    } else {
      this._onScroll;
    }
  };

  public render() {
    const {
      onRefresh,
      onPressReactions,
      onPressAddReaction,
      onPressTimestamp,
      onPressAuthor,
      onPressEtc,
      onPressShare,
      onPressExpand,
      onPressExpandReplies,
      onPressExpandCW,
      style,
      contentContainerStyle,
      progressViewOffset,
      preferredReactions,
      scrollToTop$,
      getReadable,
      lastSessionTimestamp,
      selfFeedId,
      EmptyComponent,
    } = this.props;

    const cardsCommonProps = {
      lastSessionTimestamp,
      preferredReactions,
      selfFeedId,
      onPressReactions,
      onPressAddReaction,
      onPressAuthor,
      onPressTimestamp,
      onPressEtc,
      onPressShare,
      onPressExpand,
    };
    return h(PullFlatList2, {
      getScrollStream: getReadable,
      getPrefixStream: this.getPrefixStream,
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
      onScroll: this.getOnScroll(),
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
      ListFooterComponent: this.renderFooter(),
      ListEmptyComponent: EmptyComponent,
      renderItem: ({item}: any) => {
        const thread = item as ThreadSummaryWithExtras;
        let card: ReactElement<any> | null = null;
        switch (thread?.root?.value?.content?.type) {
          case 'contact':
            card = h(FollowCard, {
              ...cardsCommonProps,
              thread,
            });
            break;

          case 'gathering':
            card = h(GatheringCard, {
              ...cardsCommonProps,
              onPressExpandReplies,
              thread,
            });
            break;

          default:
            card = h(ThreadCard, {
              ...cardsCommonProps,
              thread,
              onPressExpandReplies,
              onPressExpandCW,
            });
            break;
        }

        return h(View, {style: styles.itemContainer}, [card, h(Separator)]);
      },
    });
  }
}
