// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {createElement as $} from 'react';
import {StatusBar} from 'react-native';
import {Palette} from '~frontend/global-styles/palette';

export default function StatusBarBlank() {
  return $(StatusBar, {
    animated: true,
    backgroundColor: Palette.backgroundText,
    barStyle: Palette.isDarkTheme ? 'light-content' : 'dark-content',
    hidden: false,
  });
}
