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

const manifestServer = require('../nodejs-project/manifest');

function objMapDeep(origin: object, transform: (s: string) => string): object {
  return Object.keys(origin).reduce((acc, key) => {
    if (typeof origin[key] === 'object') {
      acc[key] = objMapDeep(origin[key], transform);
    } else {
      acc[key] = transform(origin[key]);
    }
    return acc;
  }, {});
}

function syncToAsync(str: string): string {
  return str === 'sync' ? 'async' : str;
}

export const manifest = objMapDeep(manifestServer, syncToAsync);
