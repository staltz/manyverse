/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Screens} from './enums';
import {navOptions as welcomeNavOpts} from './welcome/index';
import {navOptions as centralNavOpts} from './central/index';
import {Palette} from '../global-styles/palette';
import {Typography} from '../global-styles/typography';
import {Options, Layout} from 'react-native-navigation';

export const welcomeLayout: Layout = {
  stack: {
    id: 'mainstack',
    children: [
      {
        component: {
          name: Screens.Welcome,
          options: welcomeNavOpts,
        },
      },
    ],
  },
};

export const centralLayout: Layout = {
  sideMenu: {
    left: {
      component: {name: Screens.Drawer},
    },
    center: {
      stack: {
        id: 'mainstack',
        children: [
          {
            component: {
              name: Screens.Central,
              options: centralNavOpts,
            },
          },
        ],
      },
    },
  },
};

export const defaultNavOptions: Options = {
  statusBar: {
    visible: true,
    backgroundColor: Palette.brandStrong,
    style: 'light',
  },
  sideMenu: {
    left: {
      shouldStretchDrawer: false,
    },
  },
  layout: {
    backgroundColor: Palette.backgroundVoid,
    orientation: ['portrait', 'landscape'],
  },
  topBar: {
    visible: false,
    drawBehind: true,
    hideOnScroll: false,
    animate: false,
    height: 0,
    borderHeight: 0,
    elevation: 0,
    leftButtonColor: Palette.textForBackgroundBrand,
    background: {
      color: Palette.brandMain,
    },
    title: {
      text: '',
      color: Palette.textForBackgroundBrand,
      fontSize: Typography.fontSizeLarge,
    },
  },
};
