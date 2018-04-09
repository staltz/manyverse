/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
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
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import {FeedId} from 'ssb-typescript';
import {ThreadAndExtras, GetReadable, MsgAndExtras} from '../drivers/ssb';
import Message from './messages/Message';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import ExpandThread from './messages/ExpandThread';

export type Props = {
  thread: ThreadAndExtras;
  selfFeedId: FeedId;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

export default class CompactThread extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  private renderMessage(msg: MsgAndExtras) {
    const {selfFeedId, onPressLike, onPressAuthor} = this.props;
    return h(Message, {
      msg,
      ['key' as any]: msg.key,
      selfFeedId,
      onPressLike,
      onPressAuthor,
    });
  }

  public render() {
    const {thread, selfFeedId, onPressLike, onPressAuthor} = this.props;
    const first = thread.messages[0];
    const rest = thread.messages.slice(1);

    return [
      this.renderMessage(first),
      thread.full ? null : h(ExpandThread, {['key' as any]: '1'}),
      ...rest.map(this.renderMessage.bind(this)),
    ];
  }
}
