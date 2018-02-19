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
import {StyleSheet, TextInputProperties} from 'react-native';
import {View, TextInput} from 'react-native';
import {h} from '@cycle/native-screen';
import * as Progress from 'react-native-progress';
import {Msg, isVoteMsg, isPrivate, FeedId} from '../../ssb/types';
import {Readable} from '../../typings/pull-stream';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {Palette} from '../global-styles/palette';
import MessageContainer from './messages/MessageContainer';
import Message from './messages/Message';
import PlaceholderMessage from './messages/PlaceholderMessage';
import {MsgAndExtras, GetReadable} from '../drivers/ssb';
import PullFlatList from 'pull-flat-list';
const pull = require('pull-stream');
const Pushable = require('pull-pushable');

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
  showPlaceholder: boolean;
  onPublish?: (event: {nativeEvent: {text: string}}) => void;
};

class FeedHeader extends PureComponent<FeedHeaderProps> {
  private _textInput: TextInput;

  public render() {
    const {onPublish, showPlaceholder} = this.props;
    return h(View, [
      h(MessageContainer, {style: styles.header}, [
        h(View, {style: styles.writeMessageRow}, [
          h(View, {style: styles.writeMessageAuthorImage}),
          h(
            TextInput,
            {
              underlineColorAndroid: Palette.brand.textBackground,
              placeholderTextColor: Palette.brand.textVeryWeak,
              style: styles.writeInput,
              placeholder: 'Write a public message',
              accessible: true,
              accessibilityLabel: 'Feed Text Input',
              selectionColor: Palette.brand.text,
              returnKeyType: 'done',
              ref: (el: any) => {
                this._textInput = el;
              },
              onSubmitEditing: (ev: any) => {
                if (this._textInput) {
                  this._textInput.clear();
                }
                if (onPublish) {
                  onPublish(ev);
                }
              },
            } as TextInputProperties,
          ),
        ]),
      ]),
      showPlaceholder ? h(PlaceholderMessage) : null as any,
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
  getReadable: GetReadable<MsgAndExtras> | null;
  selfFeedId: FeedId;
  showPublishHeader: boolean;
  style?: any;
  onPublish?: (event: {nativeEvent: {text: string}}) => void;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

type State = {
  showPlaceholder: boolean;
};

export default class Feed extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {showPlaceholder: false};
    this.addedMessagesStream = Pushable();
    this._onPublish = this.onPublish.bind(this);
  }

  private addedMessagesStream: any | null;
  private _onPublish: (ev: any) => void;

  public componentDidMount() {
    this.addedMessagesStream = this.addedMessagesStream || Pushable();
  }

  public componentWillUnmount() {
    const addedMessagesStream = this.addedMessagesStream;
    if (addedMessagesStream) {
      addedMessagesStream.end();
      this.addedMessagesStream = null;
    }
  }

  private _prependAddedMessage() {
    const {getReadable} = this.props;
    if (!getReadable) return;
    const newReadable = getReadable({live: true, old: false});
    if (!newReadable) return;
    const addedMessagesStream = this.addedMessagesStream;
    const that = this;

    that.setState({showPlaceholder: true});

    const readable: Readable<MsgAndExtras> = pull(
      newReadable,
      pull.take(1),
      pull.drain((msg: MsgAndExtras) => {
        that.setState({showPlaceholder: false});
        addedMessagesStream.push(msg);
      }),
    );
  }

  private onPublish(ev: any) {
    const {onPublish} = this.props;
    if (onPublish) {
      onPublish(ev);
      this._prependAddedMessage();
    }
  }

  public render() {
    const {
      onPressLike,
      onPressAuthor,
      showPublishHeader,
      style,
      getReadable,
      selfFeedId,
    } = this.props;

    // TODO: this filter() should probably done in a better place
    // (not even in this component)
    const scrollStream = getReadable
      ? () => pull(getReadable(), pull.filter(isShowableMsg))
      : null;

    return h(PullFlatList, {
      getScrollStream: scrollStream,
      getPrefixStream: () => this.addedMessagesStream,
      style: [styles.container, style] as any,
      initialNumToRender: 5,
      numColumns: 1,
      refreshable: true,
      refreshColors: [Palette.indigo7],
      keyExtractor: (item: any, index: number) => item.key || String(index),
      ListHeaderComponent: showPublishHeader
        ? h(FeedHeader, {
            onPublish: this._onPublish,
            showPlaceholder: this.state.showPlaceholder,
          })
        : null,
      ListFooterComponent: FeedFooter,
      renderItem: ({item}: any) =>
        h(Message, {
          msg: item as MsgAndExtras,
          selfFeedId,
          onPressLike,
          onPressAuthor,
        }),
    });
  }
}
