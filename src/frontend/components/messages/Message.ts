/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import debounce from 'xstream/extra/debounce';
import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {Msg, FeedId, MsgId} from 'ssb-typescript';
import {isPostMsg, isContactMsg, isAboutMsg} from 'ssb-typescript/utils';
import {MsgAndExtras} from '../../../shared-types';
import {Likes} from '../../ssb/types';
import RawMessage from './RawMessage';
import PostMessage from './PostMessage';
import AboutMessage from './AboutMessage';
import ContactMessage from './ContactMessage';
import KeylessMessage from './KeylessMessage';
import {withXstreamProps} from 'react-xstream-hoc';

export type State = {
  hasError: boolean;
};

export type Props = {
  msg: MsgAndExtras;
  selfFeedId: FeedId;
  onPressLikeCount?: (ev: {msgKey: MsgId; likes: Likes}) => void;
  onPressLike?: (ev: {msgKey: MsgId; like: boolean}) => void;
  onPressReply?: (ev: {msgKey: MsgId; rootKey: MsgId}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
};

const PostMessageM = withXstreamProps(PostMessage, 'likes');
const RawMessageM = withXstreamProps(RawMessage, 'likes');

export default class Message extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  public componentDidCatch(error: any, info: any) {
    console.log('Message componentDidCatch');
    this.setState(() => ({hasError: true}));
  }

  public render() {
    const {msg} = this.props;
    const metadata = this.props.msg.value._$manyverse$metadata;
    const likes = (
      metadata.likes ?? (xs.never() as Stream<Array<string>>)
    ).compose(debounce(80)); // avoid DB reads flickering
    const props = {
      ...this.props,
      msg: msg as Msg<any>,
      likes,
      name: metadata.about.name,
      imageUrl: metadata.about.imageUrl,
      contactName: metadata.contact ? metadata.contact.name : undefined,
    };

    if (this.state.hasError) return h(RawMessageM, props);
    if (!msg.key) return h(KeylessMessage, props);
    if (isPostMsg(msg)) return h(PostMessageM, props);
    if (isAboutMsg(msg)) return h(AboutMessage, props);
    if (isContactMsg(msg)) return h(ContactMessage, props);
    return h(RawMessageM, props);
  }
}
