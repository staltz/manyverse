// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import '@fontsource/roboto';
import iconFont from 'react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf';
import emojiFont from './images/NotoColorEmoji.ttf';
import xs from 'xstream';
import {withState} from '@cycle/state';
import {run, GlobalScreen, Frame} from 'cycle-native-navigation-web';

import {asyncStorageDriver} from 'cycle-native-asyncstorage';
import {ssbDriver} from './lib/frontend/drivers/ssb';
import {linkingDriver} from 'cycle-native-linking';
import {makeClipboardDriver} from 'cycle-native-clipboard';
import {makeFSDriver} from './lib/frontend/drivers/fs';
import {makeNetworkDriver} from './lib/frontend/drivers/network';
import {makeEventBusDriver} from './lib/frontend/drivers/eventbus';
import {dialogDriver} from './lib/frontend/drivers/dialogs';
import {makeActivityLifecycleDriver} from './lib/frontend/drivers/lifecycle';
import {makeLocalizationDriver} from './lib/frontend/drivers/localization';
import {makeWindowSizeDriver} from './lib/frontend/drivers/window-size';
import {makeToastDriver} from './lib/frontend/drivers/toast';

import {desktopFrame} from './lib/frontend/screens/desktop-frame';
import {central} from './lib/frontend/screens/central';
import {compose} from './lib/frontend/screens/compose';
import {global} from './lib/frontend/screens/global';
import {welcome} from './lib/frontend/screens/welcome';
import {conversation} from './lib/frontend/screens/conversation';
import {recipientsInput} from './lib/frontend/screens/recipients-input';
import {pasteInvite} from './lib/frontend/screens/invite-paste';
import {profile} from './lib/frontend/screens/profile';
import {biography} from './lib/frontend/screens/biography';
import {connectionsPanel} from './lib/frontend/screens/connections-panel';
import {editProfile} from './lib/frontend/screens/profile-edit';
import {manageAliases} from './lib/frontend/screens/alias-manage';
import {registerAlias} from './lib/frontend/screens/alias-register';
import {libraries} from './lib/frontend/screens/libraries';
import {search} from './lib/frontend/screens/search';
import {thread} from './lib/frontend/screens/thread';
import {accounts} from './lib/frontend/screens/accounts';
import {backup} from './lib/frontend/screens/backup';
import {instructions} from './lib/frontend/screens/instructions';
import {secretOutput} from './lib/frontend/screens/secret-output';
import {secretInput} from './lib/frontend/screens/secret-input';
import {settings} from './lib/frontend/screens/settings';
import {rawDatabase} from './lib/frontend/screens/raw-db';
import {rawMessage} from './lib/frontend/screens/raw-msg';
import {Screens} from './lib/frontend/screens/enums';
import {welcomeLayout} from './lib/frontend/screens/layouts';

// Set up fonts
const fontStyles = `@font-face {
   src: url(dist/${iconFont});
   font-family: MaterialCommunityIcons;
 }

 @font-face {
  src: url(dist/${emojiFont}) format('truetype');
  font-family: 'NotoColorEmoji';
}`;
const style = document.createElement('style');
style.appendChild(document.createTextNode(fontStyles));
document.head.appendChild(style);

// Wait for fonts to load
document.fonts.ready.then(startCycleApp);

// Start Cycle.js app
function startCycleApp() {
  const drivers = {
    asyncstorage: asyncStorageDriver,
    clipboard: makeClipboardDriver(),
    ssb: ssbDriver,
    fs: makeFSDriver(),
    lifecycle: makeActivityLifecycleDriver(),
    network: makeNetworkDriver(),
    appstate: () => xs.of('active'),
    orientation: () =>
      makeWindowSizeDriver()(xs.never).map(({width, height}) =>
        height >= width ? 'PORTRAIT' : 'LANDSCAPE-RIGHT',
      ),
    windowSize: makeWindowSizeDriver(),
    globalEventBus: makeEventBusDriver(),
    linking: linkingDriver,
    dialog: dialogDriver,
    localization: makeLocalizationDriver(),
    keyboard: (x) => ({
      events: () => xs.never(),
    }),
    toast: makeToastDriver(),
  };

  const screens = {
    [Frame]: withState(desktopFrame),
    [GlobalScreen]: withState(global),
    [Screens.Welcome]: withState(welcome),
    [Screens.Central]: withState(central),
    [Screens.Compose]: withState(compose),
    // [Screens.ComposeAudio]: withState(composeAudio),
    [Screens.ConnectionsPanel]: withState(connectionsPanel),
    [Screens.Search]: withState(search),
    [Screens.Thread]: withState(thread),
    [Screens.Conversation]: withState(conversation),
    [Screens.RecipientsInput]: withState(recipientsInput),
    [Screens.Libraries]: libraries,
    [Screens.InvitePaste]: withState(pasteInvite),
    [Screens.Profile]: withState(profile),
    [Screens.Biography]: withState(biography),
    [Screens.ProfileEdit]: withState(editProfile),
    [Screens.AliasManage]: withState(manageAliases),
    [Screens.AliasRegister]: withState(registerAlias),
    [Screens.Accounts]: withState(accounts),
    [Screens.Backup]: withState(backup),
    [Screens.Instructions]: withState(instructions),
    [Screens.SecretOutput]: withState(secretOutput),
    [Screens.SecretInput]: withState(secretInput),
    [Screens.RawDatabase]: rawDatabase,
    [Screens.RawMessage]: rawMessage,
    [Screens.Settings]: withState(settings),
  };

  run(screens, drivers, welcomeLayout);
}
