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

import fs = require('fs');
const path = require('path');

export = function exportSecret(ssbPath: string, keys: any) {
  try {
    fs.writeFileSync(
      '/storage/emulated/0/ssb-secret',
      JSON.stringify(keys, null, 2),
      'ascii',
    );
    const gossipPath = path.join(ssbPath, 'gossip.json');
    if (fs.existsSync(gossipPath)) {
      const backupGossipPath = '/storage/emulated/0/ssb-gossip.json';
      const gossipContents = fs.readFileSync(gossipPath, 'utf-8');
      fs.writeFileSync(backupGossipPath, gossipContents, 'utf-8');
    }
    console.warn('Export of ssb-secret succeeded.');
  } catch (err) {
    console.warn('Export of ssb-secret failed.');
  }
};
