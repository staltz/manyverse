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
  Switch,
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
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  value: boolean;
  accessibilityLabel: string;
  onValueChange?: (value: boolean) => void;
}

export default class ToggleSetting extends PureComponent<Props> {
  public render() {
    const {title, subtitle, value, onValueChange, accessibilityLabel} =
      this.props;

    const touchableProps: any = {
      onPress: () => {
        this.props.onValueChange?.(!value);
      },
      pointerEvents: 'box-only',
      accessible: true,
      accessibilityRole: 'switch',
      accessibilityLabel,
    };
    if (Platform.OS === 'android') {
      touchableProps.background = TouchableNativeFeedback.Ripple(
        Palette.voidMain,
        false,
      );
    }

    return h(Touchable, touchableProps, [
      h(View, {style: styles.container}, [
        h(View, {style: styles.titleSubtitleColumn}, [
          h(Text, {style: styles.title}, title),
          subtitle ? h(Text, {style: styles.subtitle}, subtitle) : null,
        ]),
        h(Switch, {
          ...Platform.select({
            android: {
              thumbColor: Palette.voidWeak,
              trackColor: {
                false: Palette.voidMain,
                true: Palette.brandWeaker,
              },
            },
            ios: {
              trackColor: {
                false: Palette.brandMain,
                true: Palette.brandMain,
              },
            },
            web: {
              ['trackColor' as any]: Palette.voidMain,
              thumbColor: Palette.voidWeak,
              activeTrackColor: Palette.brandWeakest,
              activeThumbColor: Palette.brandMain,
            },
          }),
          value,
          onValueChange,
        }),
      ]),
    ]);
  }
}
