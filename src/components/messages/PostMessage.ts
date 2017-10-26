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
import Markdown from 'react-native-simple-markdown';
import {h} from '@cycle/native-screen';
import {rules, styles} from '../../global-styles/markdown';
import MessageContainer from './MessageContainer';
import MessageHeader from './MessageHeader';
import MessageFooter from './MessageFooter';
import {Msg, PostContent as Post, FeedId} from '../../ssb/types';

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
          `![${name}](http://localhost:7777/${encodeURIComponent(link)})`
        );
      }
    });
  }
  return result;
}

export type Props = {
  msg: Msg<Post>;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

export default class PostMessage extends Component<Props> {
  public render() {
    const props = this.props;
    const {msg} = props;
    const md = materializeMarkdown(msg.value.content);

    return h(MessageContainer, [
      h(MessageHeader, props),
      h(Markdown, {styles, rules}, [md as any]),
      h(MessageFooter, props)
    ]);
  }
}
