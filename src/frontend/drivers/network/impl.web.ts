// SPDX-FileCopyrightText: 2018-2021 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import xs, {Stream} from 'xstream';
const {ipcRenderer} = require('electron');

export default class NetworkSource {
  constructor() {}

  public bluetoothIsEnabled(): Stream<boolean> {
    return xs.of(false);
  }

  public wifiIsEnabled(): Stream<boolean> {
    return xs.of(ipcRenderer.sendSync('call-wifiIsEnabled'));
  }

  public hasInternetConnection(): Stream<boolean> {
    return xs.of(navigator.onLine);
  }
}
