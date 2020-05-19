/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {h} from '@cycle/react';
import {Platform} from 'react-native';
import {t} from '../drivers/localization';
import {Dimensions} from '../global-styles/dimens';
import HeaderButton from './HeaderButton';

export default function HeaderBackButton(sel: string) {
  return h(HeaderButton, {
    sel,
    icon: Platform.select({ios: 'chevron-left', default: 'arrow-left'}),
    ...Platform.select({ios: {iconSize: Dimensions.iconSizeLarge}}),
    accessibilityLabel: t('call_to_action.go_back.accessibility_label'),
  });
}
