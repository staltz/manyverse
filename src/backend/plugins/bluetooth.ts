// SPDX-FileCopyrightText: 2018-2019 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

const pull = require('pull-stream');
const bluetoothTransportAndPlugin = require('ssb-bluetooth');
const BluetoothManager = require('ssb-mobile-bluetooth-manager');

const dummyBluetoothPlugin = {
  name: 'bluetooth',
  version: '1.0.0',
  manifest: {
    nearbyDevices: 'source',
    nearbyScuttlebuttDevices: 'source',
    bluetoothScanState: 'source',
    makeDeviceDiscoverable: 'async',
    isEnabled: 'async',
    getMetadataForDevice: 'async',
  },
  init: () => {
    return {
      nearbyDevices: () => pull.empty(),
      nearbyScuttlebuttDevices: () => pull.empty(),
      bluetoothScanState: () => pull.empty(),
      makeDeviceDiscoverable: (_interval: any, cb: any) => {
        cb(null, true);
      },
      isEnabled: (cb: any) => {
        cb(null, false);
      },
      getMetadataForDevice: (_address: any, _cb: any) => {},
    };
  },
};

export = function createBluetoothPlugin(keys: any, appDataDir: string) {
  // Disable Bluetooth on iOS, for now
  if ((process.platform as string) === 'ios') {
    return dummyBluetoothPlugin;
  }

  const bluetoothManager: any = BluetoothManager({
    socketFolderPath: appDataDir,
    myIdent: '@' + keys.public,
    metadataServiceUUID: 'b4721184-46dc-4314-b031-bf52c2b197f3',
    controlSocketFilename: 'manyverse_bt_control.sock',
    incomingSocketFilename: 'manyverse_bt_incoming.sock',
    outgoingSocketFilename: 'manyverse_bt_outgoing.sock',
    logStreams: false,
  });

  return bluetoothTransportAndPlugin(bluetoothManager, {scope: 'public'});
};
