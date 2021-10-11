// SPDX-FileCopyrightText: 2018-2020 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {t} from '../drivers/localization';
import HeaderButton from './HeaderButton';

export default function HeaderCloseButton(sel: string) {
  return h(HeaderButton, {
    sel,
    icon: 'close',
    accessibilityLabel: t('call_to_action.close.accessibility_label'),
  });
}
