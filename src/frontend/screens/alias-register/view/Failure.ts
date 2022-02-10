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

function localizeError(err: string) {
  if (/is already taken$/.test(err)) {
    return t('register_alias.failure.alias_taken');
  } else {
    return err;
  }
}

export default function Failure({error}: {error: string}) {
  return h(View, {style: styles.container}, [
    h(Icon, {
      size: Dimensions.iconSizeHuge,
      color: Palette.textNegative,
      name: 'alert-circle-outline',
    }),
    h(Text, {style: styles.text}, [
      t('register_alias.failure.title') + '\n\n' + localizeError(error),
    ]),
    h(Button, {
      sel: 'try-again',
      text: t('register_alias.failure.call_to_action.try_again.label'),
      accessible: true,
      accessibilityLabel: t(
        'register_alias.failure.call_to_action.try_again.accessibility_label',
      ),
      style: styles.button,
    }),
  ]);
}
