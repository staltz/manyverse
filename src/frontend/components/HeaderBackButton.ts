// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {Platform} from 'react-native';
import {t} from '~frontend/drivers/localization';
import {Dimensions} from '~frontend/global-styles/dimens';
import HeaderButton from './HeaderButton';

export default function HeaderBackButton(sel: string) {
  return h(HeaderButton, {
    sel,
    icon: Platform.select({ios: 'chevron-left', default: 'arrow-left'}),
    ...Platform.select({ios: {iconSize: Dimensions.iconSizeLarge}}),
    accessibilityLabel: t('call_to_action.go_back.accessibility_label'),
  });
}
