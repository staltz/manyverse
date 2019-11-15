/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import HumanTime from 'react-human-time';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {ContactContent as Contact, Msg, FeedId} from 'ssb-typescript';
import MessageContainer from './MessageContainer';
import {shortFeedId} from '../../ssb/utils/from-ssb';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  message: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  account: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    marginLeft: Dimensions.horizontalSpaceSmall,
  },
});

export type Props = {
  msg: Msg<Contact>;
  name: string | null;
  contactName?: string;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

type ContactEvent = 'followed' | 'blocked' | 'unfollowed' | 'unblocked';

function pickFrom(t: ContactEvent, followed: any, blocked: any, unfollowed: any, unblocked: any) {
  if (t === 'followed') return followed;
  if (t === 'blocked') return blocked;
  if (t === 'unfollowed') return unfollowed;
  if (t === 'unblocked') return unblocked;
}

export default class ContactMessage extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextProps.name !== prevProps.name
    );
  }

  private _onPressOrigin = () => {
    const onPressAuthor = this.props.onPressAuthor;
    if (onPressAuthor) {
      onPressAuthor({authorFeedId: this.props.msg.value.author});
    }
  };

  private _onPressDestination = () => {
    const onPressAuthor = this.props.onPressAuthor;
    if (onPressAuthor) {
      onPressAuthor({authorFeedId: this.props.msg.value.content.contact!});
    }
  };

  public render() {
    const {msg, name, contactName} = this.props;

    // we're not sure what .flagged means
    const msgBlocking =
      (msg.value.content as any).flagged || msg.value.content.blocking
    const msgFollowing = msg.value.content.following

    if (msgBlocking === undefined && msgFollowing === undefined) {
      // if both are undefined then the message is nonstandard and we don't
      // render it
      return null
    }

    const contactEvent: ContactEvent = msgBlocking === undefined
      ? msgFollowing === true
        ? 'followed'
        : 'unfollowed'
      : msgBlocking === true
        ? 'blocked'
        : 'unblocked'

    return h(MessageContainer, [
      h(View, {style: styles.row}, [
        h(Text, {style: styles.message}, [
          h(
            Text,
            {style: styles.account, onPress: this._onPressOrigin},
            name || shortFeedId(msg.value.author),
          ),
          h(
            Text,
            pickFrom(contactEvent, ' followed ', ' blocked ', ' unfollowed ', ' unblocked '),
          ),
          h(
            Text,
            {style: styles.account, onPress: this._onPressDestination},
            contactName || shortFeedId(msg.value.content.contact || '?'),
          ),
        ]),
      ]),
      h(View, {style: styles.row}, [
        pickFrom(
          contactEvent,
          h(Icon, {
            size: Dimensions.iconSizeSmall,
            color: Palette.textPositive,
            name: 'account-plus',
          }),
          h(Icon, {
            size: Dimensions.iconSizeSmall,
            color: Palette.textNegative,
            name: 'account-remove',
          }),
          h(Icon, {
            size: Dimensions.iconSizeSmall,
            color: Palette.textVeryWeak,
            name: 'account-minus',
          }),
          h(Icon, {
            size: Dimensions.iconSizeSmall,
            color: Palette.textVeryWeak,
            name: 'account-minus',
          }),
        ),
        h(Text, {style: styles.timestamp}, [
          h(HumanTime, {time: msg.value.timestamp}),
        ]),
      ]),
    ]);
  }
}
