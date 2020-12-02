/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {PureComponent} from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, Msg, PostContent} from 'ssb-typescript';
import {withXstreamProps} from 'react-xstream-hoc';
import {
  PressReactionsEvent,
  PressAddReactionEvent,
  ThreadSummaryWithExtras,
  Reactions,
  MsgAndExtras,
} from '../ssb/types';
import {t} from '../drivers/localization';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import MessageContainer from './messages/MessageContainer';
import MessageFooter from './messages/MessageFooter';
import MessageHeader from './messages/MessageHeader';
import ContentWarning from './messages/ContentWarning';
import Markdown from './Markdown';
import Button from './Button';

export type Props = {
  thread: ThreadSummaryWithExtras;
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressExpand?: (msg: MsgAndExtras) => void;
  onPressExpandCW?: (msg: MsgAndExtras) => void;
};

/**
 * in pixels
 */
const CARD_HEIGHT = 350;

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
    bottom: Dimensions.verticalSpaceSmall,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  readMore: {
    backgroundColor: Palette.backgroundText,
  },

  footer: {
    flex: 0,
    height: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },
});

const MessageFooter$ = withXstreamProps(MessageFooter, 'reactions');

type State = {
  showReadMore: boolean;
};

export default class ThreadCard extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public state = {
    showReadMore: false,
  };

  /**
   * In pixels
   */
  public static HEIGHT = CARD_HEIGHT;

  private onMarkdownMeasured: ViewProps['onLayout'] = (ev) => {
    if (ev.nativeEvent.layout.height > POST_HEIGHT) {
      this.setState({showReadMore: true});
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
        : h(View, {key: 'p', style: styles.post}, [
            h(Markdown, {
              key: 'md',
              text: (root as Msg<PostContent>).value.content?.text ?? '',
              onLayout: this.onMarkdownMeasured,
            }),
            this.state.showReadMore
              ? h(View, {key: 'rm', style: styles.readMoreContainer}, [
                  h(Button, {
                    text: t('message.call_to_action.read_more.label'),
                    onPress: this.onPressReadMore,
                    strong: false,
                    small: true,
                    style: styles.readMore,
                    accessible: true,
                    accessibilityLabel: t(
                      'message.call_to_action.read_more.accessibility_label',
                    ),
                  }),
                ])
              : null,
          ]),
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
