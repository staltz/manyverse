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

import {Component} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import HumanTime from 'react-human-time';
import {h} from '@cycle/react';
import {FeedId, Msg} from 'ssb-typescript';
import {authorName} from '../../../ssb/from-ssb';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  messageHeaderRow: {
    flexDirection: 'row',
    flex: 1,
    marginBottom: Dimensions.verticalSpaceSmall,
  },

  messageAuthorImageContainer: {
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Dimensions.avatarBorderRadius,
    backgroundColor: Palette.indigo1,
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  messageAuthorImage: {
    borderRadius: Dimensions.avatarBorderRadius,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

  private _onPressAuthor() {
    const onPressAuthor = this.props.onPressAuthor;
    if (onPressAuthor) {
      onPressAuthor({authorFeedId: this.props.msg.value.author});
    }
  }

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
    const avatarUrl = {uri: imageUrl || undefined};
    const touchableProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: () => this._onPressAuthor(),
    };

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
      h(TouchableNativeFeedback, touchableProps, [
        h(View, {style: styles.messageAuthorImageContainer}, [
          h(Image, {
            style: styles.messageAuthorImage,
            source: avatarUrl,
          }),
        ]),
      ]),
      h(View, {style: styles.messageHeaderAuthorColumn}, [
        messageHeaderAuthorName,
        messageHeaderTimestamp,
      ]),
    ]);
  }
}
