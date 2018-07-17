/**
 * MMMMM is a mobile app for Secure Scuttlebutt networks
 *
 * Copyright (C) 2017 Andre 'Staltz' Medeiros
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

export enum Screens {
  Central = 'mmmmm.Central',
  Drawer = 'mmmmm.Drawer',
  Compose = 'mmmmm.Compose',
  Thread = 'mmmmm.Thread',
  Profile = 'mmmmm.Profile',
  ProfileEdit = 'mmmmm.Profile.Edit',
}

import onionify from 'cycle-onionify';
import {central} from './screens/central/index';
import {drawer} from './screens/drawer/index';
import {compose} from './screens/compose/index';
import {thread} from './screens/thread/index';
import {profile} from './screens/profile/index';
import {editProfile} from './screens/profile-edit/index';
import {makeKeyboardDriver} from '@cycle/native-keyboard';
import {ssbDriver} from './drivers/ssb';
import {dialogDriver} from './drivers/dialogs';
import {makeActivityLifecycleDriver} from './drivers/lifecycle';
import {Palette} from './global-styles/palette';
import {Typography} from './global-styles/typography';
import {addDisclaimer} from './alpha-disclaimer';

export const screens: {[k in Screens]?: (so: any) => any} = {
  [Screens.Central]: addDisclaimer(onionify(central)),
  [Screens.Drawer]: onionify(drawer),
  [Screens.Compose]: onionify(compose),
  [Screens.Thread]: addDisclaimer(onionify(thread)),
  [Screens.Profile]: addDisclaimer(onionify(profile)),
  [Screens.ProfileEdit]: addDisclaimer(onionify(editProfile)),
};

export const drivers = {
  keyboard: makeKeyboardDriver(),
  ssb: ssbDriver,
  lifecycle: makeActivityLifecycleDriver(),
  dialog: dialogDriver,
};

export const layout = {
  root: {
    sideMenu: {
      left: {
        visible: false,
        component: {name: Screens.Drawer},
      },
      center: {
        stack: {
          id: 'mainstack',
          children: [{component: {name: Screens.Central}}],
        },
      },
    },
  },
};

export const defaultNavOptions = {
  statusBar: {
    visible: true,
    backgroundColor: Palette.brand.backgroundDarker,
    style: 'light',
  },
  layout: {
    backgroundColor: Palette.brand.voidBackground,
    orientation: ['portrait', 'landscape'],
  },
  topBar: {
    visible: true,
    drawBehind: false,
    hideOnScroll: false,
    animate: false,
    borderHeight: 0,
    elevation: 0,
    buttonColor: Palette.white,
    background: {
      color: Palette.brand.background,
    },
    title: {
      text: '',
      color: Palette.white,
      fontSize: Typography.fontSizeLarge,
    },
  },
};
