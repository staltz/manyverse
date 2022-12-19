// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream, Subscription, Listener} from 'xstream';
import {Component, PureComponent} from 'react';
import {StyleSheet, FlatList, View, Platform} from 'react-native';
import {h} from '@cycle/react';
import {propifyMethods} from 'react-propify-methods';
import {FeedId, Msg, MsgId} from 'ssb-typescript';
import {
  ThreadAndExtras,
  MsgAndExtras,
  PressReactionsEvent,
  PressAddReactionEvent,
} from '~frontend/ssb/types';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import Message from '~frontend/components/messages/Message';
import PlaceholderMessage from '~frontend/components/messages/PlaceholderMessage';
import AnimatedLoading from '~frontend/components/AnimatedLoading';

const FlatList$ = propifyMethods(
  FlatList as any as typeof FlatList,
  'scrollToEnd' as any,
  'scrollToOffset' as any,
);
type ScrollToEndArg = Parameters<FlatList<any>['scrollToEnd']>[0];

export interface Props {
  thread: ThreadAndExtras;
  subthreads: Record<MsgId, ThreadAndExtras>;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  willPublish$?: Stream<any> | null;
  scrollToEnd$?: Stream<ScrollToEndArg>;
  startAtBottom?: boolean;
  selfFeedId: FeedId;
  loadingReplies: boolean;
  expandRootCW?: boolean;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressReplyToRoot?: () => void;
  onPressReplyToReply?: (ev: {rootMsgId: MsgId; msg: MsgAndExtras}) => void;
  onReplySeen?: (msgId: MsgId) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressTimestamp?: (timestamp: number) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressShare?: (msg: Msg) => void;
  onPressAttendGathering?: (ev: {
    isAttending: boolean;
    attendeeId: string;
    gatheringId: string;
  }) => void;
}

export const styles = StyleSheet.create({
  separator: {
    backgroundColor: Palette.voidMain,
    height: Dimensions.verticalSpaceNormal,
  },

  container: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingBottom: 52,
      },
    }),
  },

  containerInverted: {
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingTop: 52,
      },
    }),
  },

  contentContainer: {
    paddingBottom: Dimensions.verticalSpaceNormal,
  },

  contentContainerInverted: {
    paddingTop: Dimensions.verticalSpaceNormal,
  },
});

interface State {
  showPlaceholder: boolean;
}

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
    this.determineScrollStreams(props);
  }

  private subscription?: Subscription;
  private latestPublicationTimestamp: number = 0;
  private scrollToEnd$: Stream<ScrollToEndArg>;
  private scrollToOffset$: Stream<ScrollToEndArg & {offset: number}>;

  public componentDidMount() {
    const {willPublish$} = this.props;
    if (willPublish$) {
      const listener = {next: this.onWillPublish.bind(this)};
      this.subscription = willPublish$.subscribe(listener as Listener<any>);
    }
  }

  private determineScrollStreams(props: Props) {
    this.scrollToEnd$ = (props.scrollToEnd$ ?? xs.never())
      .map((params) => {
        if (this.props.startAtBottom === true) return null;
        else return params;
      })
      .filter((params) => params !== null) as typeof this.scrollToEnd$;

    this.scrollToOffset$ = (props.scrollToEnd$ ?? xs.never())
      .map((params) => {
        if (this.props.startAtBottom === true) return {...params, offset: 0};
        else return null;
      })
      .filter((params) => params !== null) as typeof this.scrollToOffset$;
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const prevProps = this.props;
    if (nextProps.selfFeedId !== prevProps.selfFeedId) return true;
    if (nextProps.loadingReplies !== prevProps.loadingReplies) return true;
    if (nextProps.startAtBottom !== prevProps.startAtBottom) return true;
    if (nextProps.expandRootCW !== prevProps.expandRootCW) return true;
    if (nextState.showPlaceholder !== this.state.showPlaceholder) return true;
    if (nextProps.thread.full !== prevProps.thread.full) return true;
    const prevMessages = prevProps.thread.messages;
    const nextMessages = nextProps.thread.messages;
    if (nextMessages.length !== prevMessages.length) return true;
    if (nextProps.onPressAuthor !== prevProps.onPressAuthor) return true;
    if (nextProps.onPressTimestamp !== prevProps.onPressTimestamp) return true;
    if (nextProps.onPressEtc !== prevProps.onPressEtc) return true;
    if (nextProps.onPressShare !== prevProps.onPressShare) return true;
    if (nextProps.onPressReactions !== prevProps.onPressReactions) return true;
    if (nextProps.onPressAttendGathering !== prevProps.onPressAttendGathering)
      return true;
    if (nextProps.onPressAddReaction !== prevProps.onPressAddReaction)
      return true;
    if (nextProps.willPublish$ !== prevProps.willPublish$) return true;
    if (nextProps.scrollToEnd$ !== prevProps.scrollToEnd$) {
      this.determineScrollStreams(nextProps);
      return true;
    }
    if (nextProps.subthreads !== prevProps.subthreads) return true;
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

  private onWillPublish() {
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
      onPressTimestamp,
      onPressAttendGathering,
      onPressEtc,
      onPressShare,
      onPressReplyToRoot,
      onPressReplyToReply,
      thread,
      subthreads,
      startAtBottom,
      lastSessionTimestamp,
      preferredReactions,
    } = this.props;
    const msg = item as MsgAndExtras;
    const root = thread.messages[0];

    let onPressReply: Message['props']['onPressReply'];
    let replyCount = 0;
    const rootIndex = startAtBottom ? thread.messages.length - 1 : 0;
    if (index === rootIndex) {
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
      expandCW: index === rootIndex && this.props.expandRootCW === true,
      webFocusHack: Platform.OS === 'web' && index === 0,
      selfFeedId,
      lastSessionTimestamp,
      preferredReactions,
      onPressReply,
      replyCount,
      onPressReactions,
      onPressAddReaction,
      onPressAuthor,
      onPressTimestamp,
      onPressAttendGathering,
      onPressEtc,
      onPressShare,
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

  public render() {
    const {startAtBottom, thread, loadingReplies} = this.props;
    const loadedEverything = !loadingReplies && thread.full;
    const threadHasOnlyRoot = thread.messages.length === 1;

    const inverted =
      startAtBottom === true && loadedEverything && !threadHasOnlyRoot;

    const data =
      startAtBottom === true
        ? loadedEverything
          ? threadHasOnlyRoot
            ? thread.messages
            : thread.messages.slice().reverse()
          : []
        : thread.messages;

    return h(FlatList$, {
      style: inverted ? styles.containerInverted : styles.container,
      contentContainerStyle: inverted
        ? styles.contentContainerInverted
        : styles.contentContainer,
      data,
      inverted,
      renderItem: this.renderMessage,
      keyExtractor: (msg: MsgAndExtras) => msg.key,
      scrollToEnd$: this.scrollToEnd$,
      scrollToOffset$: this.scrollToOffset$,
      removeClippedSubviews: false,
      ItemSeparatorComponent: Separator,
      ListFooterComponent: this.renderFooter(),
    });
  }
}
