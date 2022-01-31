// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Component} from 'react';
import {h} from '@cycle/react';
import {
  Text,
  View,
  TouchableNativeFeedback,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {Msg, PostContent} from 'ssb-typescript';
import {isPrivate} from 'ssb-typescript/utils';
import {t} from '../../drivers/localization';
import {displayName} from '../../ssb/utils/from-ssb';
import {Dimensions} from '../../global-styles/dimens';
import {Palette} from '../../global-styles/palette';
import {Typography} from '../../global-styles/typography';
import LocalizedHumanTime from '../LocalizedHumanTime';
import Avatar from '../Avatar';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const styles = StyleSheet.create({
  row: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    marginBottom: 1,
    flexDirection: 'row',
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  touchable: {
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.px,
      },
    }),
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

export interface Props {
  msg: Msg;
  name?: string;
  imageUrl: string | null;
  onPress?: (msg: Msg) => void;
}

export default class ShortRawMessage extends Component<Props> {
  private _onPress() {
    const {onPress, msg} = this.props;
    if (onPress) {
      onPress(msg);
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
    const touchableProps: any = {
      onPress: () => this._onPress(),
      style: styles.touchable,
    };
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

    const authorNameText = h(
      Text,
      {
        numberOfLines: 1,
        ellipsizeMode: 'middle',
        style: styles.authorName,
      },
      displayName(name, msg.value.author),
    );

    const msgTypeText = h(
      Text,
      {style: styles.msgType},
      isPrivate(msg)
        ? t('raw_db.item.type.encrypted')
        : t('raw_db.item.type.any', {
            type: (msg.value.content as PostContent).type,
          }),
    );

    const timestampText = h(Text, {style: styles.timestamp}, [
      h(LocalizedHumanTime, {time: msg.value.timestamp}),
    ]);

    return h(View, [
      h(Touchable, touchableProps, [
        h(View, {style: styles.row, pointerEvents: 'box-only'}, [
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
