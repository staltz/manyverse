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

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {
  Text,
  View,
  TouchableNativeFeedback,
  Image,
  StyleSheet,
} from 'react-native';
import MessageContainer from './MessageContainer';
import HumanTime from 'react-human-time';
import {MsgId, Msg, PostContent} from 'ssb-typescript';
import {authorName} from '../../../ssb/from-ssb';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {isPrivate} from 'ssb-typescript/utils';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
  },

  avatarContainer: {
    height: Dimensions.avatarSizeNormal,
    width: Dimensions.avatarSizeNormal,
    borderRadius: Dimensions.avatarBorderRadius,
    backgroundColor: Palette.indigo1,
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  avatar: {
    borderRadius: Dimensions.avatarBorderRadius,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  authorColumn: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'space-around',
  },

  authorName: {
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.text,
    minWidth: 120,
  },

  msgType: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyMonospace,
    backgroundColor: Palette.brand.darkVoidBackground,
    color: Palette.brand.darkText,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.brand.textWeak,
  },
});

export type Props = {
  msg: Msg;
  name: string | null;
  imageUrl: string | null;
  onPress?: (ev: {msgId: MsgId}) => void;
};

export default class RawMessage extends PureComponent<Props> {
  private _onPress() {
    const {onPress, msg} = this.props;
    if (onPress) {
      onPress({msgId: msg.key});
    }
  }

  public render() {
    const {msg, name, imageUrl} = this.props;
    const avatarUrl = {uri: imageUrl || undefined};
    const touchableProps = {
      background: TouchableNativeFeedback.SelectableBackground(),
      onPress: () => this._onPress(),
    };

    const authorNameText = h(
      Text,
      {
        numberOfLines: 1,
        ellipsizeMode: 'middle',
        style: styles.authorName,
      },
      authorName(name, msg),
    );

    const msgTypeText = h(
      Text,
      {style: styles.msgType},
      isPrivate(msg)
        ? 'encrypted'
        : 'type: ' + (msg.value.content as PostContent).type,
    );

    const timestampText = h(Text, {style: styles.timestamp}, [
      h(HumanTime as any, {time: msg.value.timestamp}),
    ]);

    return h(TouchableNativeFeedback, touchableProps, [
      h(MessageContainer, [
        h(View, {style: styles.row}, [
          h(View, {style: styles.avatarContainer}, [
            h(Image, {
              style: styles.avatar,
              source: avatarUrl,
            }),
          ]),
          h(View, {style: styles.authorColumn}, [
            authorNameText,
            h(Text, [timestampText, '  ' as any, msgTypeText]),
          ]),
        ]),
      ]),
    ]);
  }
}
