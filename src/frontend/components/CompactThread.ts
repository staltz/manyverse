/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {FeedId, MsgId, Msg} from 'ssb-typescript';
import {ThreadAndExtras, MsgAndExtras, Likes} from '../ssb/types';
import Message from './messages/Message';
import ExpandThread from './messages/ExpandThread';

export type Props = {
  thread: ThreadAndExtras;
  selfFeedId: FeedId;
  onPressLikeCount?: (ev: {msgKey: MsgId; likes: Likes}) => void;
  onPressLike?: (ev: {msgKey: MsgId; like: boolean}) => void;
  onPressReply?: (ev: {msgKey: MsgId; rootKey: MsgId}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
  onPressExpand: (ev: {rootMsgId: MsgId}) => void;
};

export default class CompactThread extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  private renderMessage(msg: MsgAndExtras) {
    const {
      selfFeedId,
      onPressLikeCount,
      onPressLike,
      onPressReply,
      onPressAuthor,
      onPressEtc,
    } = this.props;

    return h(Message, {
      msg,
      key: msg.key,
      selfFeedId,
      onPressLikeCount,
      onPressLike,
      onPressReply,
      onPressAuthor,
      onPressEtc,
    });
  }

  public render() {
    const {thread, onPressExpand} = this.props;
    const first = thread.messages[0];
    if (!first) return [];
    const rest = thread.messages.slice(1);

    return [
      this.renderMessage(first),
      thread.full
        ? null
        : h(ExpandThread, {
            key: '1',
            rootMsgId: first.key,
            onPress: onPressExpand,
          }),
      ...rest.map(this.renderMessage.bind(this)),
    ];
  }
}
