/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum Screens {
  Central = 'Manyverse.Central',
  Drawer = 'Manyverse.Drawer',
  Compose = 'Manyverse.Compose',
  Thread = 'Manyverse.Thread',
  InvitePaste = 'Manyverse.Invite.Paste',
  InviteCreate = 'Manyverse.Invite.Create',
  Profile = 'Manyverse.Profile',
  ProfileEdit = 'Manyverse.Profile.Edit',
  Biography = 'Manyverse.Biography',
  RawDatabase = 'Manyverse.RawDatabase',
  RawMessage = 'Manyverse.RawMessage',
}

import {withState} from '@cycle/state';
import {makeKeyboardDriver} from 'cycle-native-keyboard';
import {alertDriver} from 'cycle-native-alert';
import {makeClipboardDriver} from 'cycle-native-clipboard';
import {linkingDriver} from 'cycle-native-linking';
import {makeToastDriver} from './drivers/toast';
import {asyncStorageDriver} from 'cycle-native-asyncstorage';
import {notificationDriver} from 'cycle-native-android-local-notification';
import {ssbDriver} from './drivers/ssb';
import {shareDriver} from 'cycle-native-share';
import {makeNetworkDriver} from './drivers/network';
import {makeEventBusDriver} from './drivers/eventbus';
import {dialogDriver} from './drivers/dialogs';
import {makeActivityLifecycleDriver} from './drivers/lifecycle';
import {makeExitDriver} from './drivers/exit';
import {central, navOptions as centralNavOpts} from './screens/central/index';
import {drawer} from './screens/drawer/index';
import {compose} from './screens/compose/index';
import {thread} from './screens/thread/index';
import {pasteInvite} from './screens/invite-paste/index';
import {profile} from './screens/profile/index';
import {editProfile} from './screens/profile-edit/index';
import {createInvite} from './screens/invite-create';
import {biography} from './screens/biography/index';
import {rawDatabase} from './screens/raw-db/index';
import {rawMessage} from './screens/raw-msg/index';
import {Palette} from './global-styles/palette';
import {Typography} from './global-styles/typography';

export const screens: {[k in Screens]?: (so: any) => any} = {
  [Screens.Central]: withState(central),
  [Screens.Drawer]: withState(drawer),
  [Screens.Compose]: withState(compose),
  [Screens.Thread]: withState(thread),
  [Screens.InvitePaste]: withState(pasteInvite),
  [Screens.InviteCreate]: withState(createInvite),
  [Screens.Profile]: withState(profile),
  [Screens.ProfileEdit]: withState(editProfile),
  [Screens.Biography]: withState(biography),
  [Screens.RawDatabase]: rawDatabase,
  [Screens.RawMessage]: rawMessage,
};

export const drivers = {
  alert: alertDriver,
  asyncstorage: asyncStorageDriver,
  keyboard: makeKeyboardDriver(),
  clipboard: makeClipboardDriver(),
  linking: linkingDriver,
  globalEventBus: makeEventBusDriver(),
  ssb: ssbDriver,
  share: shareDriver,
  lifecycle: makeActivityLifecycleDriver(),
  network: makeNetworkDriver(),
  notification: notificationDriver,
  dialog: dialogDriver,
  toast: makeToastDriver(),
  exit: makeExitDriver(),
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
  },
};

export const defaultNavOptions = {
  statusBar: {
    visible: true,
    backgroundColor: Palette.backgroundBrandStrong,
    style: 'light',
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
    buttonColor: Palette.foregroundBrand,
    background: {
      color: Palette.backgroundBrand,
    },
    title: {
      text: '',
      color: Palette.foregroundBrand,
      fontSize: Typography.fontSizeLarge,
    },
  },
};
