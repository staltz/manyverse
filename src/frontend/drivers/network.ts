/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream, Listener} from 'xstream';
import {Platform} from 'react-native';
const SystemSetting = require('react-native-system-setting').default;
const hasInternet = require('react-native-has-internet');

export class NetworkSource {
  constructor() {}

  public bluetoothIsEnabled(): Stream<boolean> {
    return xs.create({
      async start(listener: Listener<boolean>) {
        if (Platform.OS === 'ios') {
          listener.next(false);
          listener.complete();
          return;
        }

        try {
          listener.next(await SystemSetting.isBluetoothEnabled());
          listener.complete();
        } catch (e) {
          listener.error(e);
        }
      },
      stop() {},
    });
  }

  public wifiIsEnabled(): Stream<boolean> {
    return xs.create({
      async start(listener: Listener<boolean>) {
        listener.next(await SystemSetting.isWifiEnabled());
        listener.complete();
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
