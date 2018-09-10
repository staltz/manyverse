/**
 * Manyverse is a mobile app for Secure Scuttlebutt networks
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

import xs, {Stream, Listener} from 'xstream';
const wifi = require('react-native-android-wifi');
const hasInternet = require('react-native-has-internet');

export class NetworkSource {
  constructor() {}

  public wifiIsEnabled(): Stream<boolean> {
    return xs.create({
      start(listener: Listener<boolean>) {
        wifi.isEnabled((isEnabled: boolean) => {
          listener.next(isEnabled);
          listener.complete();
        });
      },
      stop() {},
    });
  }

  public hasInternetConnection(): Stream<boolean> {
    return xs.create({
      start(listener: Listener<boolean>) {
        hasInternet.isConnected().then((connected: boolean) => {
          listener.next(connected);
          listener.complete();
        });
      },
      stop() {},
    });
  }
}

export function makeNetworkDriver() {
  return function networkDriver(): NetworkSource {
    return new NetworkSource();
  };
}
