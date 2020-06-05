/* Copyright (C) 2018-2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {withState} from '@cycle/state';
import {GlobalScreen, MoreScreenSinks} from 'cycle-native-navigation';
import {makeKeyboardDriver} from 'cycle-native-keyboard';
import {alertDriver} from 'cycle-native-alert';
import {makeClipboardDriver} from 'cycle-native-clipboard';
import {linkingDriver} from 'cycle-native-linking';
import {makeLocalizationDriver} from './drivers/localization';
import {makeToastDriver} from './drivers/toast';
import {asyncStorageDriver} from 'cycle-native-asyncstorage';
import {notificationDriver} from 'cycle-native-android-local-notification';
import {makeFSDriver} from './drivers/fs';
import {ssbDriver} from './drivers/ssb';
import {shareDriver} from 'cycle-native-share';
import {makeNetworkDriver} from './drivers/network';
import {makeEventBusDriver} from './drivers/eventbus';
import {dialogDriver} from './drivers/dialogs';
import {makeAppStateDriver} from './drivers/appstate';
import {makeActivityLifecycleDriver} from './drivers/lifecycle';
import {makeExitDriver} from './drivers/exit';
import {makeOrientationDriver} from './drivers/orientation';
import {makeSplashScreenDriver} from './drivers/splashscreen';

import {Screens} from './screens/enums';
import {global} from './screens/global';
import {welcome} from './screens/welcome';
import {central} from './screens/central';
import {drawer} from './screens/drawer';
import {dialogAbout} from './screens/dialog-about';
import {dialogThanks} from './screens/dialog-thanks';
import {compose} from './screens/compose';
import {thread} from './screens/thread';
import {conversation} from './screens/conversation';
import {recipientsInput} from './screens/recipients-input';
import {libraries} from './screens/libraries';
import {pasteInvite} from './screens/invite-paste';
import {profile} from './screens/profile';
import {editProfile} from './screens/profile-edit';
import {createInvite} from './screens/invite-create';
import {biography} from './screens/biography';
import {accounts} from './screens/accounts';
import {rawDatabase} from './screens/raw-db';
import {rawMessage} from './screens/raw-msg';
import {backup} from './screens/backup';
import {secretOutput} from './screens/secret-output';
import {secretInput} from './screens/secret-input';
import {settings} from './screens/settings';

export const drivers = {
  appstate: makeAppStateDriver(),
  alert: alertDriver,
  asyncstorage: asyncStorageDriver,
  keyboard: makeKeyboardDriver(),
  clipboard: makeClipboardDriver(),
  fs: makeFSDriver(),
  linking: linkingDriver,
  localization: makeLocalizationDriver(),
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
