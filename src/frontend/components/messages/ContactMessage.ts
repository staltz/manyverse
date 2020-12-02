/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {ContactContent as Contact, FeedId, Msg} from 'ssb-typescript';
import {Dimensions} from '../../global-styles/dimens';
import MessageContainer from './MessageContainer';
import {
  Reactions,
  PressReactionsEvent,
  PressAddReactionEvent,
} from '../../ssb/types';
import MessageHeader from './MessageHeader';
import ContactBody from './ContactBody';
import MessageFooter from './MessageFooter';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  footer: {
    flex: 0,
    height: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },
});

export type Props = {
  msg: Msg<Contact>;
  name?: string;
  contactName?: string;
  imageUrl: string | null;
  lastSessionTimestamp: number;
  reactions: Reactions;
  replyCount: number;
  selfFeedId: FeedId;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressReply?: () => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
};

export default class ContactMessage extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    return nextProps.msg.key !== prevProps.msg.key;
  }

  public render() {
    const props = this.props;
    const unread = props.msg.timestamp > props.lastSessionTimestamp;

    return h(MessageContainer, {}, [
      h(MessageHeader, {...props, unread}),
      h(ContactBody, props),
      h(MessageFooter, {...props, style: styles.footer}),
    ]);
  }
}
