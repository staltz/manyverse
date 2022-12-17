// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import {PureComponent} from 'react';
import {t} from 'i18n-js';
import {Typography} from '~frontend/global-styles/typography';
import {Palette} from '~frontend/global-styles/palette';
import {Dimensions} from '~frontend/global-styles/dimens';
import ToggleButton from '~frontend/components/ToggleButton';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

const styles = StyleSheet.create({
  row: {
    backgroundColor: Palette.backgroundText,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    borderTopColor: Palette.voidMain,
    borderTopWidth: 1,
    ...Platform.select({
      web: {
        width: Dimensions.desktopMiddleWidth.px,
      },
    }),
  },
  touchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashtagTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
  },
  hashtagText: {
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    color: Palette.text,
  },
  toggleButtonContainer: {
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
  },
});

export default class ListItem extends PureComponent<{
  hashtag: string;
  isSubscribed: boolean;
  onPress?: (hashtag: string) => void;
  onPressSubscribe?: (value: {
    hashtag: string;
    shouldSubscribe: boolean;
  }) => void;
}> {
  private _onPressHashtag = () => {
    this.props.onPress?.(this.props.hashtag);
  };

  private _onPressSubscribe = () => {
    this.props.onPressSubscribe?.({
      hashtag: this.props.hashtag,
      shouldSubscribe: !this.props.isSubscribed,
    });
  };

  public render() {
    const {hashtag, isSubscribed} = this.props;

    return h(View, {style: styles.row}, [
      h(
        Touchable,
        {
          onPress: this._onPressHashtag,
          pointerEvents: 'box-only',
          style: styles.touchable,
        },
        [
          h(View, {style: styles.hashtagTextContainer}, [
            h(
              Text,
              {style: styles.hashtagText, numberOfLines: 1},
              `#${hashtag}`,
            ),
          ]),
        ],
      ),
      h(View, {style: styles.toggleButtonContainer}, [
        h(ToggleButton, {
          onPress: this._onPressSubscribe,
          toggled: isSubscribed,
          text: t(
            isSubscribed
              ? 'feed_settings.subscribe_toggle.unsubscribe.label'
              : 'feed_settings.subscribe_toggle.subscribe.label',
          ),
          accessibilityLabel: t(
            isSubscribed
              ? 'feed_settings.subscribe_toggle.unsubscribe.accessibility_label'
              : 'feed_settings.subscribe_toggle.subscribe.accessibility_label',
          ),
        }),
      ]),
    ]);
  }
}
