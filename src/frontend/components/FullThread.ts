/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Stream, Subscription, Listener} from 'xstream';
import {Component, PureComponent} from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import {h} from '@cycle/react';
import {FeedId, Msg, MsgId} from 'ssb-typescript';
import {
  ThreadAndExtras,
  MsgAndExtras,
  PressReactionsEvent,
  PressAddReactionEvent,
} from '../ssb/types';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import Message from './messages/Message';
import PlaceholderMessage from './messages/PlaceholderMessage';

export type Props = {
  thread: ThreadAndExtras;
  publication$?: Stream<any> | null;
  selfFeedId: FeedId;
  onPressFork?: (ev: {rootMsgId: MsgId}) => void; // FIXME: support this?
  onPressReactions?: (ev: PressReactionsEvent) => void;
  onPressAddReaction?: (ev: PressAddReactionEvent) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
};

export const styles = StyleSheet.create({
  separator: {
    backgroundColor: Palette.backgroundVoid,
    height: Dimensions.verticalSpaceNormal,
  },

  contentContainer: {
    paddingBottom: Dimensions.verticalSpaceNormal,
  },
});

type State = {
  showPlaceholder: boolean;
};

class Separator extends PureComponent {
  public render() {
    return h(View, {style: styles.separator});
  }
}

export default class FullThread extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.renderMessage = this.renderMessage.bind(this);
    this.state = {showPlaceholder: false};
  }

  private subscription?: Subscription;

  public componentDidMount() {
    const {publication$} = this.props;
    if (publication$) {
      const listener = {next: this.onPublication.bind(this)};
      this.subscription = publication$.subscribe(listener as Listener<any>);
    }
  }

  public shouldComponentUpdate(nextProps: Props, nextState: State) {
    const prevProps = this.props;
    if (nextProps.selfFeedId !== prevProps.selfFeedId) return true;
    if (nextProps.onPressAuthor !== prevProps.onPressAuthor) return true;
    if (nextProps.onPressEtc !== prevProps.onPressEtc) return true;
    if (nextProps.onPressReactions !== prevProps.onPressReactions) return true;
    if (nextProps.onPressAddReaction !== prevProps.onPressAddReaction)
      return true;
    if (nextProps.publication$ !== prevProps.publication$) return true;
    const prevMessages = prevProps.thread.messages;
    const nextMessages = nextProps.thread.messages;
    if (nextMessages.length !== prevMessages.length) return true;
    if (nextState.showPlaceholder !== this.state.showPlaceholder) return true;
    return false;
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    const prevMessages = prevProps.thread.messages;
    const nextMessages = this.props.thread.messages;
    if (nextMessages.length > prevMessages.length) {
      this.setState({showPlaceholder: false});
    }
  }

  public componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = void 0;
    }
  }

  private onPublication() {
    this.setState({showPlaceholder: true});
  }

  private renderMessage = ({item}: any) => {
    const msg = item as MsgAndExtras;
    const {
      selfFeedId,
      onPressReactions,
      onPressAddReaction,
      onPressAuthor,
      onPressEtc,
    } = this.props;

    return h(Message, {
      msg,
      key: msg.key,
      selfFeedId,
      onPressReactions,
      onPressAddReaction,
      onPressAuthor,
      onPressEtc,
    });
  };

  public render() {
    const {thread} = this.props;
    const {showPlaceholder} = this.state;

    return h(FlatList, {
      data: thread.messages ?? [],
      renderItem: this.renderMessage,
      keyExtractor: (msg: MsgAndExtras) => msg.key,
      contentContainerStyle: styles.contentContainer,
      ItemSeparatorComponent: Separator,
      ListFooterComponent: showPlaceholder ? h(PlaceholderMessage) : null,
    });
  }
}
