/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Component} from 'react';
import {h} from '@cycle/react';
import {Text, View, TouchableNativeFeedback, StyleSheet} from 'react-native';
import HumanTime from 'react-human-time';
import {Msg, PostContent} from 'ssb-typescript';
import {authorName} from '../../ssb/utils/from-ssb';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import {isPrivate} from 'ssb-typescript/utils';
import Avatar from '../Avatar';

export const styles = StyleSheet.create({
  row: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
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
    color: Palette.text,
    minWidth: 120,
  },

  msgType: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyMonospace,
    backgroundColor: Palette.backgroundTextHacker,
    color: Palette.textHacker,
  },

  timestamp: {
    fontSize: Typography.fontSizeSmall,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
  },
});

export type Props = {
  msg: Msg;
  name: string | null;
  imageUrl: string | null;
  onPress?: (ev: {msg: Msg}) => void;
};

export default class RawMessage extends Component<Props> {
  private _onPress() {
    const {onPress, msg} = this.props;
    if (onPress) {
      onPress({msg});
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
      h(HumanTime, {time: msg.value.timestamp}),
    ]);

    return h(View, [
      h(TouchableNativeFeedback, touchableProps, [
        h(View, {style: styles.row}, [
          h(Avatar, {
            url: imageUrl,
            size: Dimensions.avatarSizeNormal,
            style: styles.avatar,
          }),
          h(View, {style: styles.authorColumn}, [
            authorNameText,
            h(Text, [timestampText, '  ', msgTypeText]),
          ]),
        ]),
      ]),
    ]);
  }
}
