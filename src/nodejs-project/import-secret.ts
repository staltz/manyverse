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

import fs = require('fs');
const path = require('path');

export = function importSecret(ssbPath: string, keysPath: string): any {
  try {
    if (fs.existsSync(keysPath)) {
      console.warn('Import of ssb-secret ignored, we already have keys.');
      return null;
    }
    const originKeysPath = '/storage/emulated/0/ssb-secret';
    const keysContents = fs.readFileSync(originKeysPath, 'ascii');
    fs.writeFileSync(keysPath, keysContents, 'ascii');
    fs.unlinkSync(originKeysPath);

    const originGossipPath = '/storage/emulated/0/ssb-gossip.json';
    const gossipPath = path.join(ssbPath, 'gossip.json');
    if (fs.existsSync(originGossipPath) && !fs.existsSync(gossipPath)) {
      const gossipContents = fs.readFileSync(originGossipPath, 'utf-8');
      fs.writeFileSync(gossipPath, gossipContents, 'utf-8');
      fs.unlinkSync(originGossipPath);
    }
    console.warn('Import of ssb-secret succeeded.');
    return JSON.parse(keysContents);
  } catch (err) {
    console.warn('Import of ssb-secret failed.');
    return null;
  }
};
