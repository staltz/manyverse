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

import {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import HumanTime from 'react-human-time';
import {h} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';
import {authorName} from '../../../ssb/from-ssb';
import Avatar from '../Avatar';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

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
    color: Palette.brand.text,
    minWidth: 120,
  },

  messageHeaderTimestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },
});

export type Props = {
  msg: Msg;
  name: string | null;
  imageUrl: string | null;
  onPressAuthor?: (ev: {authorFeedId: FeedId}) => void;
};

export default class MessageHeader extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  private _onPressAuthor = () => {
    const onPressAuthor = this.props.onPressAuthor;
    if (onPressAuthor) {
      onPressAuthor({authorFeedId: this.props.msg.value.author});
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
    const touchableProps = {onPress: this._onPressAuthor};

    const messageHeaderAuthorName = h(TouchableOpacity, touchableProps, [
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
      [h(HumanTime as any, {time: msg.value.timestamp})],
    );

    return h(View, {style: styles.messageHeaderRow}, [
      h(TouchableOpacity, touchableProps, [
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
    ]);
  }
}
