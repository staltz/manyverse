/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {FeedId, MsgId} from 'ssb-typescript';
import {ThreadAndExtras, MsgAndExtras} from '../drivers/ssb';
import Message from './messages/Message';
import ExpandThread from './messages/ExpandThread';

export type Props = {
  thread: ThreadAndExtras;
  selfFeedId: FeedId;
  onPressLike?: (ev: {msgKey: MsgId; like: boolean}) => void;
  onPressReply?: (ev: {msgKey: MsgId; rootKey: MsgId}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressExpand: (ev: {rootMsgId: MsgId}) => void;
};

export default class CompactThread extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  private renderMessage(msg: MsgAndExtras) {
    const {selfFeedId, onPressLike, onPressReply, onPressAuthor} = this.props;
    return h(Message, {
      msg,
      ['key' as any]: msg.key,
      selfFeedId,
      onPressLike,
      onPressReply,
      onPressAuthor,
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
            ['key' as any]: '1',
            rootMsgId: first.key,
            onPress: onPressExpand,
          }),
      ...rest.map(this.renderMessage.bind(this)),
    ];
  }
}
