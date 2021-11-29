// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {StyleSheet, View} from 'react-native';
import {PostContent as Post, FeedId, Msg} from 'ssb-typescript';
import {
  Reactions,
  PressReactionsEvent,
  PressAddReactionEvent,
} from '../../ssb/types';
import {getPostText} from '../../ssb/utils/from-ssb';
import {Dimensions} from '../../global-styles/dimens';
import Markdown from '../Markdown';
import MessageContainer from './MessageContainer';
import MessageHeader from './MessageHeader';
import MessageFooter from './MessageFooter';
import ContentWarning from './ContentWarning';

type CWPost = Post & {contentWarning?: string};

export interface Props {
  msg: Msg<Post>;
  name?: string;
  imageUrl: string | null;
  lastSessionTimestamp: number;
  preferredReactions: Array<string>;
  reactions: Reactions;
  replyCount: number;
  selfFeedId: FeedId;
  expandCW?: boolean;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressReply?: () => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
}

export const styles = StyleSheet.create({
  post: {
    marginTop: Dimensions.verticalSpaceNormal,
    flex: 1,
  },

  footer: {
    flex: 0,
    height: MessageFooter.HEIGHT,
    minHeight: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },

  cw: {
    marginTop: Dimensions.verticalSpaceNormal,
  },
});

type State = {
  cwOpened: boolean;
};

export default class PostMessage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {cwOpened: props.expandCW ?? false};
  }

  public onPressToggleCW = () => {
    this.setState((prev) => ({cwOpened: !prev.cwOpened}));
  };

  public render() {
    const props = this.props;
    const {msg, lastSessionTimestamp} = props;
    const cwMsg = msg as Msg<CWPost>;
    const hasCW =
      !!cwMsg.value.content.contentWarning &&
      typeof cwMsg.value.content.contentWarning === 'string';
    const opened = hasCW ? this.state.cwOpened : true;
    const unread = msg.timestamp > lastSessionTimestamp;

    return h(MessageContainer, {}, [
      h(MessageHeader, {...props, unread}),
      hasCW
        ? h(ContentWarning, {
            key: 'cw',
            description: cwMsg.value.content.contentWarning!,
            style: styles.cw,
            opened,
            onPressToggle: this.onPressToggleCW,
          })
        : null,
      opened
        ? h(View, {key: 'p', style: styles.post}, [
            h(Markdown, {
              key: 'md',
              text: getPostText(msg),
            }),
          ])
        : null,
      h(MessageFooter, {...props, style: styles.footer}),
    ]);
  }
}
