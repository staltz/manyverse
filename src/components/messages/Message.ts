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
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {Msg, PostMsg, isPostMsg} from '../../types';
import MessageContainer from './MessageContainer';
import MessageHeader from './MessageHeader';
import PostMessage from './PostMessage';
import Metadata from './Metadata';

export class KeylessMessage extends PureComponent<{msg: any}> {
  render() {
    const {msg} = this.props;
    return h(MessageContainer, [h(Metadata, {msg})]);
  }
}

export class RawMessage extends PureComponent<{msg: any}> {
  render() {
    const {msg} = this.props;
    return h(MessageContainer, [h(MessageHeader, {msg}), h(Metadata, {msg})]);
  }
}

export default class Message extends PureComponent<{msg: Msg}> {
  render() {
    const {msg} = this.props;
    if (!msg.key) return h(KeylessMessage, {msg});
    if (isPostMsg(msg)) return h(PostMessage, {msg});
    return h(RawMessage, {msg});
  }
}
