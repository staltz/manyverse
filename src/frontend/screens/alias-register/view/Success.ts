// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Text, StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '~frontend/components/Button';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import {Palette} from '~frontend/global-styles/palette';
import {Typography} from '~frontend/global-styles/typography';
import {canonicalizeAliasURL} from '~frontend/ssb/utils/alias';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginHorizontal: Dimensions.horizontalSpaceBig * 2,
    marginTop: Dimensions.verticalSpaceHuge,
  },

  text: {
    marginTop: Dimensions.verticalSpaceNormal,
    marginBottom: Dimensions.verticalSpaceBig,
    color: Palette.textWeak,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  button: {
    marginTop: Dimensions.verticalSpaceNormal,
  },
});

export default function Success({aliasURL}: {aliasURL: string}) {
  return h(View, {style: styles.container}, [
    h(Icon, {
      size: Dimensions.iconSizeHuge,
      color: Palette.textPositive,
      name: 'check-bold',
    }),
    h(Text, {style: styles.text}, [
      t('register_alias.success.title') +
        '\n\n' +
        t('register_alias.success.description', {
          alias: canonicalizeAliasURL(aliasURL),
        }),
    ]),
    h(Button, {
      sel: 'back-from-success',
      text: t('register_alias.success.call_to_action.go_back.label'),
      accessible: true,
      accessibilityLabel: t(
        'register_alias.success.call_to_action.go_back.accessibility_label',
      ),
      style: styles.button,
    }),
  ]);
}
