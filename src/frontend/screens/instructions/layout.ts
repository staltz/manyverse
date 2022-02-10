// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {Palette} from '~frontend/global-styles/palette';

export const navOptions = {
  layout: {
    backgroundColor: Palette.brandMain,
  },
  topBar: {
    visible: false,
    height: 0,
  },
  sideMenu: {
    left: {
      enabled: false,
    },
  },
};
