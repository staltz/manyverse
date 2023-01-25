// SPDX-FileCopyrightText: 2023 The Manyverse Authors
//
// SPDX-License-Identifier: MPL-2.0

import FS = require('fs');
import Path = require('path');
import {FileLite} from './types';

export default async function saveWebFile(file: File): Promise<FileLite> {
  const name = `${Date.now()}_${file.name}`;
  const path = Path.join(process.env.APP_TMP_DIR!, name);
  const arrayBuffer = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  await FS.promises.writeFile(path, buf);
  return {path, type: file.type, name};
}
