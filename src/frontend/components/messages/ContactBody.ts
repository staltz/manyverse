// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {h} from '@cycle/react';
import {ContactContent as Contact, FeedId, Msg} from 'ssb-typescript';
const Ref = require('ssb-ref');
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '~frontend/drivers/localization';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Typography} from '~frontend/global-styles/typography';
import {displayName} from '~frontend/ssb/utils/from-ssb';
import Metadata from './Metadata';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  contact: {
    marginTop: Dimensions.verticalSpaceNormal,
    flex: 1,
  },

  message: {
    fontSize: Typography.fontSizeNormal,
    lineHeight: Typography.lineHeightNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  account: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  action: {
    textTransform: 'capitalize',
    marginLeft: Dimensions.horizontalSpaceTiny,
  },
});

export interface Props {
  msg: Msg<Contact>;
  name?: string;
  contactName?: string;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
}

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

export default class ContactBody extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    return nextProps.msg.key !== prevProps.msg.key;
  }

  private onPressTarget = () => {
    this.props.onPressAuthor?.({
      authorFeedId: this.props.msg.value.content.contact!,
    });
  };

  public render() {
    const {msg, contactName} = this.props;

    // we're not sure what .flagged means
    const msgBlocking =
      (msg.value.content as any).flagged || msg.value.content.blocking;
    const msgFollowing = msg.value.content.following;

    // Validate the contact message and render metadata in case it's nonstandard
    if (
      (msgBlocking === undefined && msgFollowing === undefined) ||
      (msgBlocking === true && msgFollowing === true) ||
      !Ref.isFeedId(msg.value.content.contact)
    ) {
      return h(View, {key: 'c', style: styles.contact}, [h(Metadata, {msg})]);
    }

    const target = displayName(contactName, msg.value.content.contact!);

    const contactEvent: ContactEvent =
      msgFollowing === true
        ? 'followed'
        : msgBlocking === undefined && msgFollowing === false
        ? 'unfollowed'
        : msgBlocking === true
        ? 'blocked'
        : 'unblocked';

    const texts: [string, string, string, string, string] = pickFrom(
      contactEvent,
      [
        null, // t('message.contact.follow_event.1_normal'),
        null, // t('message.contact.follow_event.2_bold', {author}),
        t('message.contact.follow_event.3_normal'),
        t('message.contact.follow_event.4_bold', {target}),
        t('message.contact.follow_event.5_normal'),
      ],
      [
        null, // t('message.contact.block_event.1_normal'),
        null, // t('message.contact.block_event.2_bold', {author}),
        t('message.contact.block_event.3_normal'),
        t('message.contact.block_event.4_bold', {target}),
        t('message.contact.block_event.5_normal'),
      ],
      [
        null, // t('message.contact.unfollow_event.1_normal'),
        null, // t('message.contact.unfollow_event.2_bold', {author}),
        t('message.contact.unfollow_event.3_normal'),
        t('message.contact.unfollow_event.4_bold', {target}),
        t('message.contact.unfollow_event.5_normal'),
      ],
      [
        null, // t('message.contact.unblock_event.1_normal'),
        null, // t('message.contact.unblock_event.2_bold', {author}),
        t('message.contact.unblock_event.3_normal'),
        t('message.contact.unblock_event.4_bold', {target}),
        t('message.contact.unblock_event.5_normal'),
      ],
    );

    return h(View, {key: 'c', style: styles.contact}, [
      h(Text, {style: styles.message}, [
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
        h(Text, {key: 'a2', style: styles.action}, texts[2]),
        h(
          Text,
          {key: 'a3', style: styles.account, onPress: this.onPressTarget},
          texts[3],
        ),
        h(Text, {key: 'a4'}, texts[4]),
      ]),
    ]);
  }
}
