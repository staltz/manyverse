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
import {View, TouchableNativeFeedback, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {h} from '@cycle/native-screen';
import {Palette} from '../global-styles/palette';
import {Dimensions} from '../global-styles/dimens';
import {Typography} from '../global-styles/typography';

type Props = {
  icon: string;
  text: string;
  onPress?: () => void;
  accessible?: boolean;
  accessibilityLabel?: string;
};

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.white,
    paddingHorizontal: Dimensions.horizontalSpaceBig,
    paddingVertical: Dimensions.verticalSpaceBig,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  text: {
    fontFamily: Typography.fontFamilyReadableText,
    marginLeft: Dimensions.horizontalSpaceBig,
    color: Palette.brand.textWeak,
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
  },
});

export default class MenuItem extends PureComponent<Props> {
  public render() {
    const {icon, text, onPress, accessibilityLabel, accessible} = this.props;
    const touchableProps = {
      background: TouchableNativeFeedback.Ripple(Palette.gray2),
      onPress: () => {
        if (onPress) onPress();
      },
      accessible,
      accessibilityLabel,
    };

    return h(TouchableNativeFeedback, touchableProps, [
      h(View, {style: styles.container}, [
        h(Icon, {
          size: Dimensions.iconSizeNormal,
          color: Palette.brand.textWeak,
          name: icon,
        }),
        h(Text, {style: styles.text}, text),
      ]),
    ]);
  }
}
