// SPDX-FileCopyrightText: 2021-2023 The Manyverse Authors
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
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
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
        width: Dimensions.desktopMiddleWidth.px,
        maxWidth: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },

  avatar: {
    marginRight: Dimensions.horizontalSpaceSmall,
  },

  text: {
    flex: 1,
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    ...Platform.select({
      web: {
        wordBreak: 'break-all',
      },
    }),
  },
});

interface Props
  extends React.PropsWithChildren<{
    imageUrl?: string | false;
    onPress?: () => void;
  }> {}

export default class SuggestionsOptionSmall extends PureComponent<Props> {
  public render() {
    const {children, imageUrl, onPress} = this.props;

    const touchableProps: any = {
      onPress,
    };
    if (Platform.OS === 'android') {
      touchableProps.background =
        TouchableNativeFeedback.SelectableBackground();
    }

    const contentChildren = h(
      View,
      {style: styles.row, pointerEvents: 'box-only'},
      [
        imageUrl === false
          ? null
          : h(Avatar, {
              url: imageUrl,
              size: Dimensions.avatarSizeSmall,
              style: styles.avatar,
            }),
        h(
          Text,
          {
            numberOfLines: 1,
            ellipsizeMode: 'tail',
            style: styles.text,
            android_hyphenationFrequency: 'high',
          },
          [children],
        ),
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
