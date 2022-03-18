// SPDX-FileCopyrightText: 2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ipcRenderer} from 'electron';

import {Labels} from '~backend/plugins/electron/context-menu';

export default function updateBackendLocale(labels: Labels) {
  ipcRenderer.send('update-locale', labels);
}
