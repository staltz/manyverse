/* Copyright (C) 2018 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import Markdown from '../../global-styles/markdown';
import MessageContainer from './MessageContainer';
import MessageHeader from './MessageHeader';
import MessageFooter from './MessageFooter';
import {PostContent as Post, FeedId, Msg, MsgId} from 'ssb-typescript';

function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

function replaceAll(str: string, find: string, replace: string): string {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function materializeMarkdown(content: Post): string {
  let result = content.text;
  if (content.mentions) {
    content.mentions.forEach(mention => {
      if (
        mention.link &&
        mention.name &&
        mention.type &&
        mention.type === 'image/jpeg'
      ) {
        const name = mention.name;
        const link = mention.link;
        result = replaceAll(
          result,
          `![${name}](${link})`,
          `![${name}](http://localhost:7777/${encodeURIComponent(link)})`,
        );
      }
    });
  }
  return result;
}

export type Props = {
  msg: Msg<Post>;
  name: string | null;
  imageUrl: string | null;
  likes: Array<FeedId> | null;
  selfFeedId: FeedId;
  onPressLike?: (ev: {msgKey: MsgId; like: boolean}) => void;
  onPressReply?: (ev: {msgKey: MsgId; rootKey: MsgId}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
};

export default class PostMessage extends PureComponent<Props> {
  public render() {
    const props = this.props;
    const {msg} = props;
    const md = materializeMarkdown(msg.value.content);

    return h(MessageContainer, [
      h(MessageHeader, props),
      Markdown(md),
      h(MessageFooter, props),
    ]);
  }
}
