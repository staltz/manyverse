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

import {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {Msg, isPostMsg, isContactMsg} from '../../types';
import MessageContainer from './MessageContainer';
import MessageHeader from './MessageHeader';
import MessageFooter from './MessageFooter';
import PostMessage from './PostMessage';
import ContactMessage from './ContactMessage';
import Metadata from './Metadata';

export type Props = {
  msg: Msg;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
};

export class KeylessMessage extends Component<{msg: any}> {
  render() {
    const {msg} = this.props;
    return h(MessageContainer, [h(Metadata, {msg})]);
  }
}

export class RawMessage extends Component<Props> {
  render() {
    const props = this.props;
    return h(MessageContainer, [
      h(MessageHeader, props),
      h(Metadata, props),
      h(MessageFooter, props)
    ]);
  }
}

export default class Message extends Component<Props> {
  render() {
    const {msg} = this.props;
    const props = this.props;
    if (!msg.key) return h(KeylessMessage, props);
    if (isPostMsg(msg)) return h(PostMessage, props as any);
    if (isContactMsg(msg)) return h(ContactMessage, props as any);
    return h(RawMessage, {msg});
  }
}
