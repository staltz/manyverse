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

import {Stream, Subscription, Listener} from 'xstream';
import {Component, ReactElement} from 'react';
import {h} from '@cycle/react';
import {FeedId} from 'ssb-typescript';
import {ThreadAndExtras, MsgAndExtras} from '../drivers/ssb';
import Message from './messages/Message';
import PlaceholderMessage from './messages/PlaceholderMessage';

export type Props = {
  thread: ThreadAndExtras;
  publication$?: Stream<any> | null;
  selfFeedId: FeedId;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

type State = {
  showPlaceholder: boolean;
};

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
    if (nextProps.onPressLike !== prevProps.onPressLike) return true;
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

  private renderMessage(msg: MsgAndExtras) {
    const {selfFeedId, onPressLike, onPressAuthor} = this.props;
    return h(Message, {
      msg,
      ['key' as any]: msg.key,
      selfFeedId,
      onPressLike,
      onPressAuthor,
    });
  }

  public render() {
    const thread = this.props.thread;
    if (!thread.messages || thread.messages.length <= 0) return [];
    const children: Array<ReactElement<any>> = thread.messages.map(
      this.renderMessage,
    );
    if (this.state.showPlaceholder) {
      children.push(h(PlaceholderMessage, {['key' as any]: 'placeholder'}));
    }
    return children;
  }
}
