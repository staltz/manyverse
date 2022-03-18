// SPDX-FileCopyrightText: 2021-2022 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import {ipcMain} from 'electron';
import * as contextMenu from 'electron-context-menu';

type AvailableAction = Extract<
  keyof contextMenu.Actions,
  | 'copy'
  | 'copyLink'
  | 'cut'
  | 'inspect'
  | 'lookUpSelection'
  | 'paste'
  | 'saveImage'
  | 'saveImageAs'
>;

export type Labels = {
  [a in AvailableAction]?: string;
};

const DEFAULT_OPTIONS: contextMenu.Options = {
  showCopyImage: true,
  showSaveImage: true,
  showSaveImageAs: true,
  showSearchWithGoogle: false,
};

let dispose: () => void;

function createContextMenu(labels?: Labels) {
  if (dispose) dispose();

  dispose = contextMenu({
    ...DEFAULT_OPTIONS,
    labels,
  });
}

createContextMenu();

ipcMain.on('update-locale', (_event, labels: Labels) => {
  createContextMenu(labels);
});
