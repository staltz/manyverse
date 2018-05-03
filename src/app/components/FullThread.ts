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

import {Stream, Subscription, Listener} from 'xstream';
import {PureComponent, ReactElement} from 'react';
import {h} from '@cycle/native-screen';
import {FeedId} from 'ssb-typescript';
import {ThreadAndExtras, MsgAndExtras, GetReadable} from '../drivers/ssb';
import Message from './messages/Message';
import PlaceholderMessage from './messages/PlaceholderMessage';
const pull = require('pull-stream');

export type Props = {
  thread: ThreadAndExtras;
  getPublicationsReadable?: GetReadable<MsgAndExtras> | null;
  publication$?: Stream<any> | null;
  selfFeedId: FeedId;
  onPressLike?: (ev: {msgKey: string; like: boolean}) => void;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

type State = {
  showPlaceholder: boolean;
  thread: ThreadAndExtras;
};

export default class FullThread extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.renderMessage = this.renderMessage.bind(this);
    this.state = {showPlaceholder: false, thread: this.props.thread};
  }

  private subscription?: Subscription;

  public componentDidMount() {
    const {publication$} = this.props;
    if (publication$) {
      const listener = {next: this.onPublication.bind(this)};
      this.subscription = publication$.subscribe(listener as Listener<any>);
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.setState(prev => ({...prev, thread: nextProps.thread}));
  }

  public componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = void 0;
    }
  }

  private onPublication() {
    const {getPublicationsReadable} = this.props;
    if (!getPublicationsReadable) return;
    const readable = getPublicationsReadable({live: true, old: false});
    if (!readable) return;
    const that = this;

    this.setState(() => ({showPlaceholder: true}));
    pull(
      readable,
      pull.take(1),
      pull.drain((msg: MsgAndExtras) => {
        that.setState((prev: State) => ({
          showPlaceholder: false,
          thread: {
            messages: prev.thread.messages.concat([msg]),
            full: prev.thread.full,
          },
        }));
      }),
    );
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
    const {thread} = this.state;
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
