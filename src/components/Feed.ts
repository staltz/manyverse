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

import {PureComponent, Component} from 'react';
import {StyleSheet} from 'react-native';
import {View, FlatList, TextInput} from 'react-native';
import {h} from '@cycle/native-screen';
import {Msg, isVoteMsg, FeedId} from '../ssb/types';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {Palette} from '../global-styles/palette';
import MessageContainer from './messages/MessageContainer';
import Message from './messages/Message';

export const styles = StyleSheet.create({
  writeMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  writeMessageAuthorImage: {
    height: 45,
    width: 45,
    borderRadius: 3,
    backgroundColor: Palette.indigo1,
    marginRight: Dimensions.horizontalSpaceSmall,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  writeInput: {
    flex: 1,
    fontSize: Typography.fontSizeBig,
    color: Palette.brand.text,
  },

  container: {
    alignSelf: 'stretch',
    flex: 1,
  },
});

export type FeedData = {
  updated: number;
  arr: Array<Msg>;
};

export const emptyFeed: FeedData = {
  updated: 0,
  arr: [],
};

type FeedProps = {
  feed: FeedData;
  showPublishHeader: boolean;
  style?: any;
  onPublish?: (event: {nativeEvent: {text: string}}) => void;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

type FeedHeaderProps = {
  onPublish?: (event: {nativeEvent: {text: string}}) => void;
};

class FeedHeader extends PureComponent<FeedHeaderProps> {
  public render() {
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
          },
        }),
      ]),
    ]);
  }
}

export default class Feed extends Component<FeedProps, {updated: number}> {
  constructor(props: FeedProps) {
    super(props);
    this.state = props.feed;
  }

  public componentWillReceiveProps(props: any) {
    if (props.feed.updated > this.state.updated) {
      this.setState(props.feed);
    }
  }

  public render() {
    const {
      feed,
      onPublish,
      onPressLike,
      onPressAuthor,
      showPublishHeader,
      style,
    } = this.props;

    return h(FlatList, {
      data: feed.arr,
      style: [styles.container, style] as any,
      ListHeaderComponent: showPublishHeader
        ? h(FeedHeader, {onPublish})
        : null,
      keyExtractor: (item: any, index: number) => item.key || String(index),
      renderItem: ({item}: {item: Msg}) =>
        h(Message, {msg: item, onPressLike, onPressAuthor}),
    });
  }
}
