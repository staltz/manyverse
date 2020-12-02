/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {PureComponent} from 'react';
import {StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, Msg, ContactContent} from 'ssb-typescript';
import {withXstreamProps} from 'react-xstream-hoc';
import {
  PressReactionsEvent,
  PressAddReactionEvent,
  ThreadSummaryWithExtras,
  Reactions,
  MsgAndExtras,
} from '../ssb/types';
import {Dimensions} from '../global-styles/dimens';
import MessageContainer from './messages/MessageContainer';
import MessageFooter from './messages/MessageFooter';
import MessageHeader from './messages/MessageHeader';
import ContactBody from './messages/ContactBody';

export type Props = {
  thread: ThreadSummaryWithExtras;
  selfFeedId: FeedId;
  lastSessionTimestamp: number;
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressExpand?: (msg: MsgAndExtras) => void;
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  footer: {
    flex: 0,
    height: MessageFooter.HEIGHT,
    marginBottom: -Dimensions.verticalSpaceBig,
  },
});

const MessageFooter$ = withXstreamProps(MessageFooter, 'reactions');

export default class FollowCard extends PureComponent<Props> {
  private onPressReplyHandler = () => {
    this.props.onPressExpand?.(this.props.thread.root);
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
    const contactName = metadata.contact?.name;
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
      h(ContactBody, {
        msg: root as MsgAndExtras<ContactContent>,
        contactName,
        onPressAuthor,
      }),
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
