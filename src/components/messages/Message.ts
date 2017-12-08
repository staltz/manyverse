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

import {Component, PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {
  Msg,
  isPostMsg,
  isContactMsg,
  isAboutMsg,
  FeedId,
} from '../../ssb/types';
import {MsgAndExtras} from '../../drivers/ssb';
import MessageContainer from './MessageContainer';
import MessageHeader, {Props as HeaderProps} from './MessageHeader';
import MessageFooter, {Props as FooterProps} from './MessageFooter';
import PostMessage from './PostMessage';
import AboutMessage from './AboutMessage';
import ContactMessage from './ContactMessage';
import Metadata from './Metadata';

export type Props = {
  msg: MsgAndExtras;
  selfFeedId: FeedId;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

export class KeylessMessage extends PureComponent<{msg: any}> {
  public render() {
    const {msg} = this.props;
    return h(MessageContainer, [h(Metadata, {msg})]);
  }
}

export class RawMessage extends PureComponent<HeaderProps & FooterProps> {
  public render() {
    const props = this.props;
    return h(MessageContainer, [
      h(MessageHeader, props),
      h(Metadata, props),
      h(MessageFooter, props),
    ]);
  }
}

export default class Message extends PureComponent<Props> {
  public render() {
    const {msg} = this.props;
    const streams = this.props.msg.value._streams;
    const props = {
      ...this.props,
      msg: msg as Msg<any>,
      likes: streams.likes,
      name: streams.about.name,
      imageUrl: streams.about.imageUrl,
    };
    if (!msg.key) return h(KeylessMessage, props);
    if (isPostMsg(msg)) return h(PostMessage, props);
    if (isAboutMsg(msg)) return h(AboutMessage, props);
    if (isContactMsg(msg)) return h(ContactMessage, props);
    return h(RawMessage, props);
  }
}
