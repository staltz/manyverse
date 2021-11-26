// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {withState} from '@cycle/state';
import {MoreScreenSinks} from 'cycle-native-navigation';
import {makeKeyboardDriver} from 'cycle-native-keyboard';
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
import {makeRecorderDriver} from './drivers/recorder';
import {makeOrientationDriver} from './drivers/orientation';
import {makeWindowSizeDriver} from './drivers/window-size';
import {makeSplashScreenDriver} from './drivers/splashscreen';
import {GlobalScreen} from './symbols';

import {Screens} from './screens/enums';
import {global} from './screens/global';
import {welcome} from './screens/welcome';
import {central} from './screens/central';
import {drawer} from './screens/drawer';
import {dialogAbout} from './screens/dialog-about';
import {dialogThanks} from './screens/dialog-thanks';
import {compose} from './screens/compose';
import {composeAudio} from './screens/compose-audio';
import {connectionsPanel} from './screens/connections-panel';
import {search} from './screens/search';
import {thread} from './screens/thread';
import {conversation} from './screens/conversation';
import {recipientsInput} from './screens/recipients-input';
import {libraries} from './screens/libraries';
import {pasteInvite} from './screens/invite-paste';
import {profile} from './screens/profile';
import {editProfile} from './screens/profile-edit';
import {registerAlias} from './screens/alias-register';
import {manageAliases} from './screens/alias-manage';
import {biography} from './screens/biography';
import {accounts} from './screens/accounts';
import {rawDatabase} from './screens/raw-db';
import {rawMessage} from './screens/raw-msg';
import {backup} from './screens/backup';
import {instructions} from './screens/instructions';
import {secretOutput} from './screens/secret-output';
import {secretInput} from './screens/secret-input';
import {settings} from './screens/settings';

export const drivers = {
  appstate: makeAppStateDriver(),
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
  recorder: makeRecorderDriver(),
  orientation: makeOrientationDriver(),
  windowSize: makeWindowSizeDriver(),
  splashscreen: makeSplashScreenDriver(),
  exit: makeExitDriver(),
};

type AcceptableSinks = MoreScreenSinks & {
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
  [Screens.ComposeAudio]: withState(composeAudio),
  [Screens.ConnectionsPanel]: withState(connectionsPanel),
  [Screens.Search]: withState(search),
  [Screens.Thread]: withState(thread),
  [Screens.Conversation]: withState(conversation),
  [Screens.RecipientsInput]: withState(recipientsInput),
  [Screens.Libraries]: libraries,
  [Screens.InvitePaste]: withState(pasteInvite),
  [Screens.Profile]: withState(profile),
  [Screens.ProfileEdit]: withState(editProfile),
  [Screens.AliasManage]: withState(manageAliases),
  [Screens.AliasRegister]: withState(registerAlias),
  [Screens.Biography]: withState(biography),
  [Screens.Accounts]: withState(accounts),
  [Screens.Backup]: withState(backup),
  [Screens.Instructions]: withState(instructions),
  [Screens.SecretOutput]: withState(secretOutput),
  [Screens.SecretInput]: withState(secretInput),
  [Screens.RawDatabase]: rawDatabase,
  [Screens.RawMessage]: rawMessage,
  [Screens.Settings]: withState(settings),
};
