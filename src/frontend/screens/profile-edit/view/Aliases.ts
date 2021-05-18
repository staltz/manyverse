/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {
  View,
  Text,
  Platform,
  TouchableNativeFeedback,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {t} from '../../../drivers/localization';
import Button from '../../../components/Button';
import {Dimensions} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';
import {Alias} from '../../../ssb/types';
import {canonicalizeAliasURL} from '../../../ssb/utils/alias';
import {State} from '../model';
import {styles} from './styles';

const Touchable = Platform.select<any>({
  android: TouchableNativeFeedback,
  default: TouchableOpacity,
});

export default function Aliases({
  aliases,
  onRegister,
  onRemove,
}: {
  aliases: State['aliases'];
  onRegister?: () => {};
  onRemove?: (a: Alias) => void;
}) {
  return h(View, {style: styles.aliasesContainer}, [
    h(Button, {
      key: 'r',
      style: styles.registerNewAlias,
      onPress: () => onRegister?.(),
      strong: true,
      text: t('profile_edit.call_to_action.register_new_alias.label'),
      accessible: true,
      accessibilityLabel: t(
        'profile_edit.call_to_action.register_new_alias.accessibility_label',
      ),
    }),

    ...aliases.map((a) =>
      h(View, {key: a.aliasURL, style: styles.aliasRow}, [
        h(Icon, {
          size: Dimensions.iconSizeSmall,
          color: Palette.textBrand,
          name: 'link-variant',
        }),

        h(
          Text,
          {selectable: true, style: styles.aliasLink},
          canonicalizeAliasURL(a.aliasURL),
        ),

        h(Touchable, {onPress: () => onRemove?.(a)}, [
          h(Icon, {
            size: Dimensions.iconSizeNormal,
            color: Palette.textVeryWeak,
            style: styles.aliasRemove,
            name: 'delete',
          }),
        ]),
      ]),
    ),
  ]);
}
