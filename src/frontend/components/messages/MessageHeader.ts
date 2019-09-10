/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import HumanTime from 'react-human-time';
import {h} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';
import {authorName} from '../../ssb/utils/from-ssb';
import Avatar from '../Avatar';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const styles = StyleSheet.create({
  messageHeaderRow: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  messageAuthorImage: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  messageHeaderAuthorColumn: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  messageHeaderAuthorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
    minWidth: 120,
  },

  messageHeaderTimestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

export type Props = {
  msg: Msg;
  name: string | null;
  imageUrl: string | null;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
  onPressEtc?: (msg: Msg) => void;
};

export default class MessageHeader extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  private _onPressAuthor = () => {
    const onPressAuthor = this.props.onPressAuthor;
    if (onPressAuthor) {
      onPressAuthor({authorFeedId: this.props.msg.value.author});
    }
  };

  private _onPressEtc = () => {
    const onPressEtc = this.props.onPressEtc;
    if (onPressEtc) {
      onPressEtc(this.props.msg);
    }
  };

  public shouldComponentUpdate(nextProps: Props) {
    const prevProps = this.props;
    return (
      nextProps.msg.key !== prevProps.msg.key ||
      nextProps.name !== prevProps.name ||
      nextProps.imageUrl !== prevProps.imageUrl
    );
  }

  public render() {
    const {msg, name, imageUrl} = this.props;
    const authorTouchableProps = {
      onPress: this._onPressAuthor,
      activeOpacity: 0.4,
    };
    const etcTouchableProps = {onPress: this._onPressEtc, activeOpacity: 0.4};

    const messageHeaderAuthorName = h(TouchableOpacity, authorTouchableProps, [
      h(
        Text,
        {
          numberOfLines: 1,
          ellipsizeMode: 'middle',
          style: styles.messageHeaderAuthorName,
        },
        authorName(name, msg),
      ),
    ]);

    const messageHeaderTimestamp = h(
      Text,
      {style: styles.messageHeaderTimestamp},
      [h(HumanTime, {time: msg.value.timestamp})],
    );

    return h(View, {style: styles.messageHeaderRow}, [
      h(TouchableOpacity, authorTouchableProps, [
        h(Avatar, {
          size: Dimensions.avatarSizeNormal,
          url: imageUrl,
          style: styles.messageAuthorImage,
        }),
      ]),
      h(View, {style: styles.messageHeaderAuthorColumn}, [
        messageHeaderAuthorName,
        messageHeaderTimestamp,
      ]),
      h(TouchableOpacity, etcTouchableProps, [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.textVeryWeak,
          name: 'chevron-down',
          accessible: true,
          accessibilityLabel: 'Etc Button',
        }),
      ]),
    ]);
  }
}
