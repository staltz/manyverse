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

import xs, {Stream} from 'xstream';
import {PureComponent} from 'react';
import {View, FlatList, Text, TextInput} from 'react-native';
import {h} from '@cycle/native-screen';
import {Palette} from '../global-styles/palette';
import Message from '../components/messages/Message';
import MessageContainer from '../components/messages/MessageContainer';
import {Msg} from '../types';
import {styles} from './styles';

type PublicFeedProps = {
  feed: Array<Msg>;
  onPublish?: (event: {nativeEvent: {text: string}}) => void;
};

type PublicFeedHeaderProps = {
  onPublish?: (event: {nativeEvent: {text: string}}) => void;
};

class PublicFeedHeader extends PureComponent<PublicFeedHeaderProps> {
  render() {
    const {onPublish} = this.props;
    return h(MessageContainer, [
      h(View, {style: styles.writeMessageRow}, [
        h(View, {style: styles.writeMessageAuthorImage}),
        h(TextInput, {
          underlineColorAndroid: Palette.brand.textBackground,
          placeholderTextColor: Palette.brand.textVeryWeak,
          style: styles.writeInput,
          placeholder: 'Write a public message',
          selectionColor: Palette.brand.text,
          returnKeyType: 'done',
          onSubmitEditing: (ev: any) => {
            if (onPublish) {
              onPublish(ev);
            }
            // (Temporary or permanent) hack:
            if (
              ev &&
              ev._targetInst &&
              ev._targetInst._currentElement &&
              ev._targetInst._currentElement._owner &&
              ev._targetInst._currentElement._owner._instance &&
              ev._targetInst._currentElement._owner._instance.clear
            ) {
              ev._targetInst._currentElement._owner._instance.clear();
            }
          }
        })
      ])
    ]);
  }
}

class PublicFeed extends PureComponent<PublicFeedProps> {
  render() {
    const {feed, onPublish} = this.props;
    return h(FlatList, {
      data: feed,
      style: styles.container as any,
      ListHeaderComponent: h(PublicFeedHeader, {onPublish}),
      keyExtractor: (item: any, index: number) => item.key || String(index),
      renderItem: ({item}: {item: Msg}) => h(Message, {msg: item})
    });
  }
}

export default function view(feed$: Stream<Msg>) {
  const vdom$ = feed$
    .fold((arr, msg) => arr.concat(msg), [] as Array<Msg>)
    .map(arr => arr.slice().reverse())
    .map(feed => h(PublicFeed, {selector: 'publicFeed', feed}));

  return vdom$;
}
