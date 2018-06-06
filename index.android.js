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

import 'react-native-ssb-shims';
import RNNav from 'react-native-navigation';
import {run} from '@cycle/run';
import onionify from 'cycle-onionify';
import {makeKeyboardDriver} from '@cycle/native-keyboard';
import {makeSingleScreenNavDrivers} from 'cycle-native-navigation';
import {ssbDriver} from './lib/app/drivers/ssb';
import {dialogDriver} from './lib/app/drivers/dialogs';
import {makeActivityLifecycleDriver} from './lib/app/drivers/lifecycle';
import {app, screenIDs} from './lib/app/index';
import {navOptions as centralScreenNavOptions} from './lib/app/screens/central';
import nodejs from 'nodejs-mobile-react-native';

const {
  screenVNodeDriver,
  commandDriver,
} = makeSingleScreenNavDrivers(RNNav, screenIDs, {
  screen: centralScreenNavOptions(),
  animationType: 'fade',
});

nodejs.start('index.js');

RNNav.Navigation.isAppLaunched().then(appLaunched => {
  if (appLaunched) {
    startCycleApp();
  }
  new RNNav.NativeEventsReceiver().appLaunched(startCycleApp);
});

function startCycleApp() {
  run(onionify(app), {
    screen: screenVNodeDriver,
    navigation: commandDriver,
    keyboard: makeKeyboardDriver(),
    ssb: ssbDriver,
    lifecycle: makeActivityLifecycleDriver(),
    dialog: dialogDriver,
  });
}
