// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Stream, Subscription, Listener} from 'xstream';
import {Component, PureComponent} from 'react';
import {StyleSheet, FlatList, View, ViewabilityConfig} from 'react-native';
import {h} from '@cycle/react';
import {propifyMethods} from 'react-propify-methods';
import {FeedId, Msg, MsgId} from 'ssb-typescript';
import {
  ThreadAndExtras,
  MsgAndExtras,
  PressReactionsEvent,
  PressAddReactionEvent,
} from '../ssb/types';
import {t} from '../drivers/localization';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import Message from './messages/Message';
import PlaceholderMessage from './messages/PlaceholderMessage';
import AnimatedLoading from './AnimatedLoading';

const FlatList$ = propifyMethods(FlatList, 'scrollToEnd' as any);
type ViewabilityInfo = Parameters<
  NonNullable<FlatList<MsgAndExtras>['props']['onViewableItemsChanged']>
>[0];
type ScrollToEndArg = Parameters<FlatList<any>['scrollToEnd']>[0];

export type Props = {
  thread: ThreadAndExtras;
  subthreads: Record<MsgId, ThreadAndExtras>;
  lastSessionTimestamp: number;
  publication$?: Stream<any> | null;
  scrollToEnd$?: Stream<ScrollToEndArg>;
  selfFeedId: FeedId;
  loadingReplies: boolean;
  expandRootCW?: boolean;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressReplyToRoot?: () => void;
  onPressReplyToReply?: (ev: {rootMsgId: MsgId; msg: MsgAndExtras}) => void;
  onReplySeen?: (msgId: MsgId) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  onViewableItemsChanged?: (info: ViewabilityInfo) => void;
};

export const styles = StyleSheet.create({
  separator: {
    backgroundColor: Palette.voidMain,
    height: Dimensions.verticalSpaceNormal,
  },

  contentContainer: {
    paddingBottom: Dimensions.verticalSpaceNormal,
  },
});

type State = {
  showPlaceholder: boolean;
};

class Separator extends PureComponent {
  public render() {
    return h(View, {style: styles.separator});
  }
}

export default class FullThread extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.renderMessage = this.renderMessage.bind(this);
    this.state = {showPlaceholder: false};
  }

  private subscription?: Subscription;
  private repliesSeen: Set<MsgId> = new Set();
  private latestPublicationTimestamp: number = 0;

  public componentDidMount() {
    const {publication$} = this.props;
    if (publication$) {
      const listener = {next: this.onPublication.bind(this)};
      this.subscription = publication$.subscribe(listener as Listener<any>);
    }
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const prevProps = this.props;
    if (nextProps.selfFeedId !== prevProps.selfFeedId) return true;
    if (nextProps.loadingReplies !== prevProps.loadingReplies) return true;
    if (nextProps.onPressAuthor !== prevProps.onPressAuthor) return true;
    if (nextProps.onPressEtc !== prevProps.onPressEtc) return true;
    if (nextProps.onPressReactions !== prevProps.onPressReactions) return true;
    if (nextProps.onPressAddReaction !== prevProps.onPressAddReaction)
      return true;
    if (nextProps.expandRootCW !== prevProps.expandRootCW) return true;
    if (nextProps.publication$ !== prevProps.publication$) return true;
    if (nextProps.scrollToEnd$ !== prevProps.scrollToEnd$) return true;
    if (nextProps.thread.full !== prevProps.thread.full) return true;
    if (nextProps.subthreads !== prevProps.subthreads) return true;
    const prevMessages = prevProps.thread.messages;
    const nextMessages = nextProps.thread.messages;
    if (nextMessages.length !== prevMessages.length) return true;
    if (nextState.showPlaceholder !== this.state.showPlaceholder) return true;
    return false;
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    const prevMessages = prevProps.thread.messages;
    const nextMessages = this.props.thread.messages;
    if (nextMessages.length > prevMessages.length) {
      this.setState({showPlaceholder: false});
      this.latestPublicationTimestamp = Date.now();
    }
  }

  public componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = void 0;
    }
  }

  private onPublication() {
    // Prevent possible race condition in case ssb-db2 publication is very fast
    if (Date.now() > this.latestPublicationTimestamp + 200) {
      this.setState({showPlaceholder: true});
    }
  }

  private renderMessage = ({item, index}: any) => {
    const {
      selfFeedId,
      onPressReactions,
      onPressAddReaction,
      onPressAuthor,
      onPressEtc,
      onPressReplyToRoot,
      onPressReplyToReply,
      thread,
      subthreads,
      lastSessionTimestamp,
    } = this.props;
    const msg = item as MsgAndExtras;
    const root = thread.messages[0];

    let onPressReply: Message['props']['onPressReply'];
    let replyCount = 0;
    if (index === 0) {
      onPressReply = () => {
        onPressReplyToRoot?.();
      };
      replyCount = thread.messages.length - 1;
    } else if (subthreads[msg.key]) {
      const subthread = subthreads[msg.key];
      onPressReply = () => {
        onPressReplyToReply?.({rootMsgId: root.key, msg});
      };
      replyCount = subthread.messages.length - 1;
    }

    return h(Message, {
      msg,
      key: msg.key,
      expandCW: index === 0 && this.props.expandRootCW === true,
      selfFeedId,
      lastSessionTimestamp,
      onPressReply,
      replyCount,
      onPressReactions,
      onPressAddReaction,
      onPressAuthor,
      onPressEtc,
    });
  };

  private renderFooter = () => {
    const {loadingReplies} = this.props;
    const {showPlaceholder} = this.state;
    const text = t('thread.loading_replies');

    if (loadingReplies && showPlaceholder) {
      return h(View, [h(PlaceholderMessage), h(AnimatedLoading, {text})]);
    } else if (loadingReplies) {
      return h(AnimatedLoading, {text});
    } else if (showPlaceholder) {
      return h(PlaceholderMessage);
    } else {
      return null;
    }
  };

  private onViewableItemsChanged = (info: ViewabilityInfo) => {
    this.props.onViewableItemsChanged?.(info);

    const {onReplySeen} = this.props;
    if (!onReplySeen) return;
    for (const token of info.changed) {
      if (
        token.isViewable && // User sees it
        (token.index ?? 0) > 0 && // It's not the root
        !this.repliesSeen.has(token.item.key) // User hasn't seen it before
      ) {
        this.repliesSeen.add(token.item.key);
        onReplySeen(token.item.key);
      }
    }
  };

  private static viewabilityConfig: ViewabilityConfig = {
    minimumViewTime: 200,
    itemVisiblePercentThreshold: 10,
  };

  public render() {
    const {thread, scrollToEnd$} = this.props;

    return h(FlatList$, {
      data: thread.messages ?? [],
      renderItem: this.renderMessage,
      keyExtractor: (msg: MsgAndExtras) => msg.key,
      contentContainerStyle: styles.contentContainer,
      scrollToEnd$,
      onViewableItemsChanged: this.onViewableItemsChanged,
      viewabilityConfig: FullThread.viewabilityConfig,
      ItemSeparatorComponent: Separator,
      ListFooterComponent: this.renderFooter(),
    });
  }
}
