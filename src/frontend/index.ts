/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Screens} from './enums';
import {withState} from '@cycle/state';
import {GlobalScreen, MoreScreenSinks} from 'cycle-native-navigation';
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
import {makeOrientationDriver} from './drivers/orientation';
import {makeSplashScreenDriver} from './drivers/splashscreen';
import {global} from './screens/global/index';
import {welcome} from './screens/welcome/index';
import {central} from './screens/central/index';
import {drawer} from './screens/drawer/index';
import {dialogAbout} from './screens/dialog-about/index';
import {dialogThanks} from './screens/dialog-thanks/index';
import {compose} from './screens/compose/index';
import {thread} from './screens/thread/index';
import {conversation} from './screens/conversation/index';
import {recipientsInput} from './screens/recipients-input';
import {libraries} from './screens/libraries/index';
import {pasteInvite} from './screens/invite-paste/index';
import {profile} from './screens/profile/index';
import {editProfile} from './screens/profile-edit/index';
import {createInvite} from './screens/invite-create';
import {biography} from './screens/biography/index';
import {accounts} from './screens/accounts/index';
import {rawDatabase} from './screens/raw-db/index';
import {rawMessage} from './screens/raw-msg/index';
import {backup} from './screens/backup/index';
import {secretOutput} from './screens/secret-output/index';
import {secretInput} from './screens/secret-input/index';
import {settings} from './screens/settings/index';

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
  orientation: makeOrientationDriver(),
  splashscreen: makeSplashScreenDriver(),
  exit: makeExitDriver(),
};

type AcceptableSinks = MoreScreenSinks &
  {
    [k in keyof typeof drivers]?: Parameters<typeof drivers[k]>[0];
  };

type ScreensMapping = {
  [GlobalScreen]?: (so: any) => AcceptableSinks;
} & {
  [k in Screens]?: (so: any) => AcceptableSinks;
};

export const screens: ScreensMapping = {
  [GlobalScreen]: withState(global),
  [Screens.Welcome]: withState(welcome),
  [Screens.Central]: withState(central),
  [Screens.Drawer]: withState(drawer),
  [Screens.DialogAbout]: dialogAbout,
  [Screens.DialogThanks]: dialogThanks,
  [Screens.Compose]: withState(compose),
  [Screens.Thread]: withState(thread),
  [Screens.Conversation]: withState(conversation),
  [Screens.RecipientsInput]: withState(recipientsInput),
  [Screens.Libraries]: libraries,
  [Screens.InvitePaste]: withState(pasteInvite),
  [Screens.InviteCreate]: withState(createInvite),
  [Screens.Profile]: withState(profile),
  [Screens.ProfileEdit]: withState(editProfile),
  [Screens.Biography]: withState(biography),
  [Screens.Accounts]: withState(accounts),
  [Screens.Backup]: withState(backup),
  [Screens.SecretOutput]: withState(secretOutput),
  [Screens.SecretInput]: withState(secretInput),
  [Screens.RawDatabase]: rawDatabase,
  [Screens.RawMessage]: rawMessage,
  [Screens.Settings]: withState(settings),
};
