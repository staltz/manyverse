// SPDX-FileCopyrightText: 2020-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {PureComponent} from 'react';
import {h} from '@cycle/react';
import {
  View,
  Text,
  Platform,
  TouchableNativeFeedback,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {Dimensions} from '~frontend/global-styles/dimens';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Dimensions.verticalSpaceNormal,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    minHeight: 60,
  },

  titleSubtitleColumn: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },

  title: {
    fontSize: Typography.fontSizeNormal,
    color: Palette.text,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },

  subtitle: {
    fontSize: Typography.fontSizeSmall,
    color: Palette.textWeak,
    ...Platform.select({
      web: {
        fontFamily: Typography.fontFamilyReadableText,
      },
    }),
  },
});

export interface Props {
  title: string;
  subtitle?: string;
  accessibilityLabel: string;
  onPress?: () => void;
}

export default class LinkSetting extends PureComponent<Props> {
  public render() {
    const {title, subtitle, accessibilityLabel} = this.props;

    const touchableProps: any = {
      onPress: () => {
        this.props.onPress?.();
      },
      pointerEvents: 'box-only',
      accessible: true,
      accessibilityLabel,
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.Ripple(
        Palette.voidMain,
        false,
      );
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.container, pointerEvents: 'box-only'}, [
        h(View, {style: styles.titleSubtitleColumn}, [
          h(Text, {style: styles.title}, title),
          subtitle ? h(Text, {style: styles.subtitle}, subtitle) : null,
        ]),
      ]),
    ]);
  }
}
