/* Copyright (C) 2018-2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {PureComponent} from 'react';
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import {h} from '@cycle/react';
import Svg, {Rect, Defs, LinearGradient, Stop} from 'react-native-svg';
import {FeedId, Msg, PostContent} from 'ssb-typescript';
import {withXstreamProps} from 'react-xstream-hoc';
import {
  PressReactionsEvent,
  PressAddReactionEvent,
  ThreadSummaryWithExtras,
  Reactions,
  MsgAndExtras,
} from '../ssb/types';
import {getPostText} from '../ssb/utils/from-ssb';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import MessageContainer from './messages/MessageContainer';
import MessageFooter from './messages/MessageFooter';
import MessageHeader from './messages/MessageHeader';
import ContentWarning from './messages/ContentWarning';
import Markdown from './Markdown';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export interface Props {
  thread: ThreadSummaryWithExtras;
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressExpand?: (msg: MsgAndExtras) => void;
  onPressExpandCW?: (msg: MsgAndExtras) => void;
}

/**
 * in pixels
 */
const CARD_HEIGHT = Platform.OS === 'web' ? 400 : 350;

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

  post: {
    marginTop: Dimensions.verticalSpaceNormal,
    overflow: 'hidden',
    maxHeight: POST_HEIGHT,
    flex: 1,
  },

  readMoreContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  footer: {
    flex: 0,
    height: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },
});

const MessageFooter$ = withXstreamProps(MessageFooter, 'reactions');

interface State {
  showReadMore: boolean;
  markdownWidth: number;
}

export default class ThreadCard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public state = {
    showReadMore: false,
    markdownWidth: 1,
  };

  /**
   * In pixels
   */
  public static HEIGHT = CARD_HEIGHT;

  private onMarkdownMeasured: ViewProps['onLayout'] = (ev) => {
    if (ev.nativeEvent.layout.height > POST_HEIGHT) {
      this.setState({
        showReadMore: true,
        markdownWidth: ev.nativeEvent.layout.width,
      });
    }
  };

  private onPressReadMore = () => {
    this.props.onPressExpand?.(this.props.thread.root);
  };

  private onPressReplyHandler = () => {
    this.props.onPressExpand?.(this.props.thread.root);
  };

  private onExpandCW = () => {
    this.props.onPressExpandCW?.(this.props.thread.root);
  };

  public renderReadMore() {
    const width = this.state.markdownWidth;
    const height = POST_HEIGHT * 0.5;
    return h(View, {style: styles.readMoreContainer}, [
      h(Svg, {width, height}, [
        h(Defs, [
          h(LinearGradient, {id: 'grad', x1: '0', y1: '0', x2: '0', y2: '1'}, [
            h(Stop, {
              offset: '0',
              stopColor: Palette.backgroundText,
              stopOpacity: '0',
            }),
            h(Stop, {
              offset: '1',
              stopColor: Palette.backgroundText,
              stopOpacity: '1',
            }),
          ]),
        ]),
        h(Rect, {
          x: '0',
          y: '0',
          width,
          height,
          fill: 'url(#grad)',
          strokeWidth: '0',
        }),
      ]),
    ]);
  }

  public renderPost(root: Msg<PostContent>) {
    const markdownChild = h(Markdown, {
      key: 'md',
      text: getPostText(root),
      onLayout: this.onMarkdownMeasured,
    });

    if (this.state.showReadMore) {
      return h(
        Touchable,
        {
          onPress: this.onPressReadMore,
          pointerEvents: 'box-only',
          ...Platform.select({
            android: {
              background: TouchableNativeFeedback.SelectableBackground(),
            },
          }),
        },
        [
          h(View, {key: 'p', style: styles.post}, [
            markdownChild,
            this.renderReadMore(),
          ]),
        ],
      );
    } else {
      return h(View, {key: 'p', style: styles.post}, [markdownChild]);
    }
  }

  public render() {
    const {
      thread,
      selfFeedId,
      lastSessionTimestamp,
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
        replyCount: thread.replyCount,
        onPressReactions,
        onPressAddReaction,
        onPressReply: this.onPressReplyHandler,
        onPressEtc,
      }),
    ]);
  }
}
