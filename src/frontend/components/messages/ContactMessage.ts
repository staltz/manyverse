/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {ContactContent as Contact, Msg, FeedId} from 'ssb-typescript';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import {displayName} from '../../ssb/utils/from-ssb';
import LocalizedHumanTime from '../LocalizedHumanTime';
import MessageContainer from './MessageContainer';

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
  name?: string;
  contactName?: string;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

type ContactEvent = 'followed' | 'blocked' | 'unfollowed' | 'unblocked';

function pickFrom(
  x: ContactEvent,
  followed: any,
  blocked: any,
  unfollowed: any,
  unblocked: any,
) {
  if (x === 'followed') return followed;
  if (x === 'blocked') return blocked;
  if (x === 'unfollowed') return unfollowed;
  if (x === 'unblocked') return unblocked;
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
      (msg.value.content as any).flagged || msg.value.content.blocking;
    const msgFollowing = msg.value.content.following;

    if (msgBlocking === undefined && msgFollowing === undefined) {
      // if both are undefined then the message is nonstandard and we don't
      // render it
      return null;
    }

    const author = displayName(name, msg.value.author);
    const target = displayName(contactName, msg.value.content.contact!);

    const contactEvent: ContactEvent =
      msgBlocking === undefined
        ? msgFollowing === true
          ? 'followed'
          : 'unfollowed'
        : msgBlocking === true
        ? 'blocked'
        : 'unblocked';

    const texts: [string, string, string, string, string] = pickFrom(
      contactEvent,
      [
        t('message.contact.follow_event.1_normal'),
        t('message.contact.follow_event.2_bold', {author}),
        t('message.contact.follow_event.3_normal'),
        t('message.contact.follow_event.4_bold', {target}),
        t('message.contact.follow_event.5_normal'),
      ],
      [
        t('message.contact.block_event.1_normal'),
        t('message.contact.block_event.2_bold', {author}),
        t('message.contact.block_event.3_normal'),
        t('message.contact.block_event.4_bold', {target}),
        t('message.contact.block_event.5_normal'),
      ],
      [
        t('message.contact.unfollow_event.1_normal'),
        t('message.contact.unfollow_event.2_bold', {author}),
        t('message.contact.unfollow_event.3_normal'),
        t('message.contact.unfollow_event.4_bold', {target}),
        t('message.contact.unfollow_event.5_normal'),
      ],
      [
        t('message.contact.unblock_event.1_normal'),
        t('message.contact.unblock_event.2_bold', {author}),
        t('message.contact.unblock_event.3_normal'),
        t('message.contact.unblock_event.4_bold', {target}),
        t('message.contact.unblock_event.5_normal'),
      ],
    );

    return h(MessageContainer, [
      h(View, {key: 'a', style: styles.row}, [
        h(Text, {style: styles.message}, [
          h(Text, {key: 'a0'}, texts[0]),
          h(
            Text,
            {key: 'a1', style: styles.account, onPress: this._onPressOrigin},
            texts[1],
          ),
          h(Text, {key: 'a2'}, texts[2]),
          h(
            Text,
            {
              key: 'a3',
              style: styles.account,
              onPress: this._onPressDestination,
            },
            texts[3],
          ),
          h(Text, {key: 'a4'}, texts[4]),
        ]),
      ]),
      h(View, {key: 'b', style: styles.row}, [
        pickFrom(
          contactEvent,
          h(Icon, {
            key: 'icon',
            size: Dimensions.iconSizeSmall,
            color: Palette.textPositive,
            name: 'account-plus',
          }),
          h(Icon, {
            key: 'icon',
            size: Dimensions.iconSizeSmall,
            color: Palette.textNegative,
            name: 'account-remove',
          }),
          h(Icon, {
            key: 'icon',
            size: Dimensions.iconSizeSmall,
            color: Palette.textVeryWeak,
            name: 'account-minus',
          }),
          h(Icon, {
            key: 'icon',
            size: Dimensions.iconSizeSmall,
            color: Palette.textVeryWeak,
            name: 'account-minus',
          }),
        ),
        h(Text, {key: 'ts', style: styles.timestamp}, [
          h(LocalizedHumanTime, {time: msg.value.timestamp}),
        ]),
      ]),
    ]);
  }
}
