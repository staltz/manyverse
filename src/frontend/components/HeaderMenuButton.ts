// SPDX-FileCopyrightText: 2018-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {h} from '@cycle/react';
import {t} from '~frontend/drivers/localization';
import HeaderButton from './HeaderButton';

export default function HeaderMenuButton(sel: string) {
  return h(HeaderButton, {
    sel,
    icon: 'menu',
    accessibilityLabel: t('call_to_action.open_menu.accessibility_label'),
  });
}
