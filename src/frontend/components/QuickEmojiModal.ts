// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PureComponent} from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableNativeFeedback,
  TouchableWithoutFeedback,
} from 'react-native';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';
import {t} from '../drivers/localization';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const touchableProps: any = {};
if (Platform.OS === 'android') {
  touchableProps.background = TouchableNativeFeedback.SelectableBackground();
}

const THUMBS_UP_UNICODE = '\ud83d\udc4d';
const VICTORY_HAND_UNICODE = String.fromCodePoint(parseInt('270C', 16));
const HEART_UNICODE = '\u2764\ufe0f';
const SEE_NO_EVIL_MONKEY_UNICODE = String.fromCodePoint(parseInt('1F648', 16));
const SMILING_WITH_HEART_EYES_UNICODE = String.fromCodePoint(
  parseInt('1F60D', 16),
);
const GRINNING_WITH_SMILE_UNICODE = String.fromCodePoint(parseInt('1F604', 16));
const CRYING_FACE_UNICODE = String.fromCodePoint(parseInt('1F622', 16));

const DEFAULT_EMOJIS = [
  THUMBS_UP_UNICODE,
  VICTORY_HAND_UNICODE,
  HEART_UNICODE,
  SEE_NO_EVIL_MONKEY_UNICODE,
  SMILING_WITH_HEART_EYES_UNICODE,
  GRINNING_WITH_SMILE_UNICODE,
  CRYING_FACE_UNICODE,
];

export const styles = StyleSheet.create({
  modal: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    flex: 1,
  },

  background: {
    backgroundColor: Palette.isDarkTheme
      ? Palette.transparencyDarkStrong
      : Palette.transparencyDark,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },

  container: {
    backgroundColor: Palette.backgroundText,
    borderRadius: Dimensions.borderRadiusBig,
    marginHorizontal: Dimensions.horizontalSpaceNormal,
    marginVertical: Dimensions.verticalSpaceNormal,
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceNormal,
    flexDirection: 'column',
    ...Platform.select({
      web: {
        width: '50vw',
        marginHorizontal: '25vw',
      },
    }),
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  touchable: {
    minWidth: 60,
    height: 60,
    minHeight: 60,
    width: 60,
    flex: 0,
    flexBasis: 'auto',
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emojiChoice: {
    fontSize: 30,
    fontFamily: Platform.select({web: Typography.fontFamilyReadableText}),
  },
});

export interface Props {
  onPressEmoji: (emoji: string) => void;
  onPressOthers: () => void;
  onPressOutside: () => void;
  preferredEmojis: Array<string>;
}

export class QuickEmojiModal extends PureComponent<Props> {
  private renderEmojiChoice = (emoji: string) => {
    const child = h(Text, {style: styles.emojiChoice}, emoji);
    const {onPressEmoji} = this.props;

    return h(
      Touchable,
      {
        ...touchableProps,
        onPress: () => onPressEmoji(emoji),
        style: Platform.OS === 'web' ? styles.touchable : null,
        accessible: true,
        accessibilityRole: 'button',
      },
      [
        Platform.OS === 'web'
          ? child
          : h(View, {style: styles.touchable}, [child]),
      ],
    );
  };

  private renderOthersChoice() {
    const child = h(Icon, {
      style: styles.emojiChoice,
      key: 'showall',
      color: Palette.textWeak,
      name: 'dots-horizontal',
    });

    return h(
      Touchable,
      {
        ...touchableProps,
        style: Platform.OS === 'web' ? styles.touchable : null,
        onPress: this.onPressOthers,
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: t(
          'message.reactions.show_more.accessibility_label',
        ),
      },
      [
        Platform.OS === 'web'
          ? child
          : h(View, {style: styles.touchable}, [child]),
      ],
    );
  }

  private onPressOthers = () => {
    this.props.onPressOthers();
  };

  private onPressOutside = () => {
    this.props.onPressOutside();
  };

  public render() {
    const preferredEmojis = this.props.preferredEmojis;
    const others = DEFAULT_EMOJIS.filter((e) => !preferredEmojis.includes(e));
    const emojis = [...preferredEmojis, ...others];
    const FIRST_ROW = emojis.slice(0, 4);
    const SECOND_ROW = emojis.slice(4, 7);

    return h(View, {style: styles.modal}, [
      h(View, {style: styles.container}, [
        h(View, {style: styles.row}, FIRST_ROW.map(this.renderEmojiChoice)),
        h(View, {style: styles.row}, [
          ...SECOND_ROW.map(this.renderEmojiChoice),
          this.renderOthersChoice(),
        ]),
      ]),
      h(TouchableWithoutFeedback, {onPress: this.onPressOutside}, [
        h(View, {style: styles.background}),
      ]),
    ]);
  }
}
