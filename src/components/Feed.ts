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
import * as Progress from 'react-native-progress';
import {Msg, isVoteMsg, isPrivate, FeedId} from '../ssb/types';
import {Readable} from '../typings/pull-stream';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {Palette} from '../global-styles/palette';
import MessageContainer from './messages/MessageContainer';
import Message from './messages/Message';
import {isPrimitive} from 'util';
import {MsgAndExtras} from '../drivers/ssb';
const pull = require('pull-stream');

export const styles = StyleSheet.create({
  header: {
    paddingTop: 0,
  },

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

  footer: {
    alignSelf: 'flex-start',
    marginLeft: Dimensions.horizontalSpaceBig,
    marginTop: Dimensions.verticalSpaceBig,
    marginBottom: Dimensions.verticalSpaceBig,
  },
});

type FeedHeaderProps = {
  onPublish?: (event: {nativeEvent: {text: string}}) => void;
};

class FeedHeader extends PureComponent<FeedHeaderProps> {
  public render() {
    const {onPublish} = this.props;
    return h(MessageContainer, {style: styles.header}, [
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

const FeedFooter = h(Progress.CircleSnail, {
  style: styles.footer,
  indeterminate: true,
  size: 40,
  color: Palette.brand.backgroundLighterContrast,
});

/**
 * Whether or not the message should be shown in the feed.
 *
 * TODO: This should be configurable in the app settings!
 */
function isShowableMsg(msg: Msg): boolean {
  return !isVoteMsg(msg) && !isPrivate(msg);
}

type Props = {
  readable: Readable<MsgAndExtras> | null;
  selfFeedId: FeedId;
  showPublishHeader: boolean;
  style?: any;
  onPublish?: (event: {nativeEvent: {text: string}}) => void;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

type State = {
  data: Array<MsgAndExtras>;
  isExpectingMore: boolean;
  updateInt: number;
};

export default class Feed extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {data: [], isExpectingMore: true, updateInt: 0};
    this.isPulling = false;
    this.morePullQueue = 0;
  }

  private isPulling: boolean;
  private morePullQueue: number;
  private stream?: Readable<MsgAndExtras>;

  public componentDidMount() {
    if (this.props.readable) {
      this.start(this.props.readable);
    }
  }

  public componentWillUnmount() {
    if (this.stream) {
      this.stream(true, () => {});
    }
  }

  /**
   * Consumes a valid pull stream (Readable) and begins pulling it.
   */
  public start(stream: Readable<Msg>) {
    this.stream = pull(stream, pull.filter(isShowableMsg));
    if (this.state.isExpectingMore) {
      this._pullSome(4);
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    const nextReadable = nextProps.readable;
    if (nextReadable && nextReadable !== this.props.readable) {
      this.start(nextReadable);
    }
  }

  private _onEndReached(info: {distanceFromEnd: number}): void {
    if (this.state.isExpectingMore) {
      this._pullSome(30);
    }
  }

  private _onEndPullingSome(
    buffer: Array<MsgAndExtras>,
    isExpectingMore: boolean,
  ) {
    this.isPulling = false;
    this.setState((prev: State) => ({
      data: prev.data.concat(buffer),
      isExpectingMore,
      updateInt: 1 - prev.updateInt,
    }));
    const remaining = this.morePullQueue;
    if (remaining > 0) {
      this.morePullQueue = 0;
      this._pullSome(remaining);
    }
  }

  private _pullSome(amount: number): void {
    const stream = this.stream;
    if (!stream) return;
    if (this.isPulling) {
      this.morePullQueue = amount;
      return;
    }
    this.isPulling = true;
    const that = this;
    const buffer: Array<MsgAndExtras> = [];
    stream(null, function read(end, msg) {
      if (end === true) {
        that._onEndPullingSome(buffer, false);
      } else if (msg) {
        const idxStored = that.state.data.findIndex(m => m.key === msg.key);
        const idxInBuffer = buffer.findIndex(m => m.key === msg.key);

        // Consume message
        if (idxStored >= 0) {
          const newData = that.state.data;
          newData[idxStored] = msg;
          that.setState((prev: State) => ({
            data: newData,
            isExpectingMore: prev.isExpectingMore,
            updateInt: 1 - prev.updateInt,
          }));
        } else if (idxInBuffer >= 0) {
          buffer[idxInBuffer] = msg;
        } else {
          buffer.push(msg);

          // Continue
          if (buffer.length >= amount) {
            that._onEndPullingSome(buffer, that.state.isExpectingMore);
          } else {
            stream(null, read);
          }
        }
      }
    });
  }

  public render() {
    const {
      onPublish,
      onPressLike,
      onPressAuthor,
      showPublishHeader,
      style,
      selfFeedId,
    } = this.props;

    return h(FlatList, {
      data: this.state.data,
      extraData: this.state.updateInt,
      style: [styles.container, style] as any,
      initialNumToRender: 5,
      numColumns: 1,
      keyExtractor: (item: any, index: number) => item.key || String(index),
      onEndReached: (info: {distanceFromEnd: number}) => {
        this._onEndReached(info);
      },
      onEndReachedThreshold: 4,
      ListHeaderComponent: showPublishHeader
        ? h(FeedHeader, {onPublish})
        : null,
      ListFooterComponent: this.state.isExpectingMore ? FeedFooter : null,
      renderItem: ({item}: {item: MsgAndExtras}) =>
        h(Message, {msg: item, selfFeedId, onPressLike, onPressAuthor}),
    });
  }
}
