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
