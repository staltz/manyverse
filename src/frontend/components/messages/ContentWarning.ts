/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import {h} from '@cycle/react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../../drivers/localization';
import {Palette} from '../../global-styles/palette';
import {Dimensions} from '../../global-styles/dimens';
import {Typography} from '../../global-styles/typography';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Dimensions.horizontalSpaceNormal,
    paddingVertical: Dimensions.verticalSpaceNormal,
    backgroundColor: Palette.backgroundTextWeak,
    borderColor: Palette.textVeryWeak,
    borderWidth: 0.5,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  toggle: {
    marginLeft: Dimensions.horizontalSpaceNormal,
    fontSize: Typography.fontSizeNormal,
    fontWeight: 'bold',
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.text,
  },

  description: {
    flex: 1,
    fontSize: Typography.fontSizeNormal,
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textWeak,
    textAlign: 'left',
  },
});

export type Props = {
  description: string;
  opened: boolean;
  onPressToggle: () => void;
  style?: StyleProp<ViewStyle>;
};

export default class ContentWarning extends PureComponent<Props> {
  public render() {
    const {description, opened, style} = this.props;
    const touchableProps = {
      onPress: this.props.onPressToggle,
      activeOpacity: 0.4,
      key: 'b',
    };

    return h(
      View,
      {style: [styles.container, style ?? null] as readonly ViewStyle[]},
      [
        h(Text, {key: 'a', style: styles.description, selectable: true}, [
          h(Icon, {
            size: Typography.fontSizeNormal,
            color: Palette.textWeak,
            name: 'alert',
          }),
          ' ',
          description,
        ]),
        h(TouchableOpacity, touchableProps, [
          h(
            Text,
            {
              numberOfLines: 1,
              ellipsizeMode: 'middle',
              style: styles.toggle,
            },
            opened
              ? t('message.content_warning.call_to_action.hide')
              : t('message.content_warning.call_to_action.show'),
          ),
        ]),
      ],
    );
  }
}
