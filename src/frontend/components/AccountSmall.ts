// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {
  Text,
  View,
  TouchableNativeFeedback,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {displayName} from '../ssb/utils/from-ssb';
import {t} from '../drivers/localization';
import {Dimensions} from '../global-styles/dimens';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import Avatar from './Avatar';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const styles = StyleSheet.create({
  row: {
    flex: 1,
    backgroundColor: Palette.backgroundText,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceSmall,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      web: {
        maxWidth: Dimensions.desktopMiddleWidth.vw,
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
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    minWidth: 120,
    ...Platform.select({
      web: {
        wordBreak: 'break-all',
      },
    }),
  },

  boldText: {
    maxWidth: 100,
    color: Palette.text,
    fontWeight: 'bold',
  },
});

interface AccountProps {
  id: string;
  name?: string;
  imageUrl?: string;
  onPress?: () => void;
}

export default class AccountSmall extends PureComponent<AccountProps> {
  public render() {
    const {id, name, imageUrl, onPress} = this.props;

    const touchableProps: any = {
      onPress,
    };
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

    let renderedName = name ? displayName(name, id) : '';
    if (renderedName.length > 20) {
      renderedName = renderedName.substr(0, 20) + '...';
    }

    const authorNameText = h(
      Text,
      {
        numberOfLines: 1,
        ellipsizeMode: 'tail',
        style: styles.authorName,
        android_hyphenationFrequency: 'high',
      },
      [h(Text, {style: styles.boldText}, renderedName), '  ' + id],
    );

    const contentChildren = h(
      View,
      {style: styles.row, pointerEvents: 'box-only'},
      [
        h(Avatar, {
          url: imageUrl,
          size: Dimensions.avatarSizeSmall,
          style: styles.avatar,
        }),
        h(View, {style: styles.authorColumn}, [authorNameText]),
      ],
    );

    return h(
      View,
      {
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t(
          'accounts.call_to_action.open_account.accessibility_label',
        ),
      },
      [
        onPress
          ? h(Touchable, touchableProps, [contentChildren])
          : contentChildren,
      ],
    );
  }
}
