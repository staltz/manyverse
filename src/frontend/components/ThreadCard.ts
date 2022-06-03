// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {PureComponent} from 'react';
import {Platform, StyleSheet, ViewProps} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, Msg, PostContent} from 'ssb-typescript';
import {withXstreamProps} from 'react-xstream-hoc';
import {
  PressReactionsEvent,
  PressAddReactionEvent,
  ThreadSummaryWithExtras,
  Reactions,
  MsgAndExtras,
} from '~frontend/ssb/types';
import {getPostText} from '~frontend/ssb/utils/from-ssb';
import {Dimensions} from '~frontend/global-styles/dimens';
import MessageContainer from './messages/MessageContainer';
import MessageFooter from './messages/MessageFooter';
import MessageHeader from './messages/MessageHeader';
import ContentWarning from './messages/ContentWarning';
import Markdown from './Markdown';
import ReadMoreOverlay from './ReadMoreOverlay';

export interface Props {
  thread: ThreadSummaryWithExtras;
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressExpand?: (msg: MsgAndExtras) => void;
  onPressExpandReplies?: (msg: MsgAndExtras) => void;
  onPressExpandCW?: (msg: MsgAndExtras) => void;
}

/**
 * in pixels
 */
const CARD_HEIGHT =
  Platform.OS === 'web' ? Dimensions.desktopMiddleWidth.number : 350;

const POST_HEIGHT =
  CARD_HEIGHT -
  Dimensions.verticalSpaceBig - // MessageContainer padding top
  MessageHeader.HEIGHT -
  Dimensions.verticalSpaceNormal - // post margin top
  MessageFooter.HEIGHT;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    flex: 0,
    height: MessageFooter.HEIGHT,
    minHeight: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },
});

const MessageFooter$ = withXstreamProps(MessageFooter, 'reactions');

interface State {
  showFadingReadMore: boolean;
  markdownWidth: number;
}

export default class ThreadCard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public state = {
    showFadingReadMore: false,
    markdownWidth: 1,
  };

  /**
   * In pixels
   */
  public static HEIGHT = CARD_HEIGHT;

  private onMarkdownMeasured: ViewProps['onLayout'] = (ev) => {
    if (ev.nativeEvent.layout.height > POST_HEIGHT) {
      this.setState({
        showFadingReadMore: true,
        markdownWidth: ev.nativeEvent.layout.width,
      });
    } else {
      this.setState({markdownWidth: ev.nativeEvent.layout.width});
    }
  };

  private onPressReadMore = () => {
    this.props.onPressExpand?.(this.props.thread.root);
  };

  private onPressReplyHandler = () => {
    this.props.onPressExpandReplies?.(this.props.thread.root);
  };

  private onExpandCW = () => {
    this.props.onPressExpandCW?.(this.props.thread.root);
  };

  public renderPost(root: Msg<PostContent>) {
    const markdownChild = h(Markdown, {
      key: 'md',
      text: getPostText(root),
      onLayout: this.onMarkdownMeasured,
    });

    return h(
      ReadMoreOverlay,
      {
        fading: this.state.showFadingReadMore,
        maxHeight: POST_HEIGHT,
        onPress: this.onPressReadMore,
        width: this.state.markdownWidth,
      },
      [markdownChild],
    );
  }

  public render() {
    const {
      thread,
      selfFeedId,
      lastSessionTimestamp,
      preferredReactions,
      onPressAddReaction,
      onPressReactions,
      onPressAuthor,
      onPressEtc,
    } = this.props;
    const {root} = thread;
    const metadata = root.value._$manyverse$metadata;
    const reactions = (
      metadata.reactions ?? (xs.never() as Stream<Reactions>)
    ).compose(debounce(80)); // avoid DB reads flickering
    const cwMsg = root as Msg<{contentWarning?: string}>;
    const hasCW =
      !!cwMsg.value.content.contentWarning &&
      typeof cwMsg.value.content.contentWarning === 'string';
    const unread = thread.timestamp > lastSessionTimestamp;

    return h(MessageContainer, {style: styles.container}, [
      h(MessageHeader, {
        key: 'mh',
        msg: root,
        unread,
        name: metadata.about.name,
        imageUrl: metadata.about.imageUrl,
        onPressAuthor,
      }),
      hasCW
        ? h(ContentWarning, {
            key: 'cw',
            description: cwMsg.value.content.contentWarning!,
            opened: false,
            onPressToggle: this.onExpandCW,
          })
        : this.renderPost(root as Msg<PostContent>),
      h(MessageFooter$, {
        key: 'mf',
        style: styles.footer,
        msg: root,
        selfFeedId,
        reactions,
        preferredReactions,
        replyCount: thread.replyCount,
        onPressReactions,
        onPressAddReaction,
        onPressReply: this.onPressReplyHandler,
        onPressEtc,
      }),
    ]);
  }
}
