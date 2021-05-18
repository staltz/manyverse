/* Copyright (C) 2021 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {Text, StyleSheet, View, ActivityIndicator} from 'react-native';
import {t} from '../../../drivers/localization';
import {Dimensions} from '../../../global-styles/dimens';
import {Palette} from '../../../global-styles/palette';
import {Typography} from '../../../global-styles/typography';

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
    color: Palette.textVeryWeak,
    fontSize: Typography.fontSizeBig,
    lineHeight: Typography.lineHeightBig,
    fontFamily: Typography.fontFamilyReadableText,
    fontWeight: 'bold',
  },
});

export default function Submitting() {
  return h(View, {style: styles.container}, [
    h(ActivityIndicator, {
      animating: true,
      size: Dimensions.iconSizeHuge,
      color: Palette.brandMain,
    }),
    h(Text, {style: styles.text}, [t('register_alias.submitting.title')]),
  ]);
}
