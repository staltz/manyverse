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

const nest = require('depnest');

function makeKeysOpinion(keys: any): any {
  const keysOpinion = {
    needs: nest('config.sync.load', 'first'),
    gives: nest({
      'keys.sync': ['load', 'id'],
    }),

    create: (api: any) => {
      return nest({
        'keys.sync': {load, id},
      });
      function id() {
        return load().id;
      }
      function load() {
        return keys;
      }
    },
  };
  return keysOpinion;
}

export default makeKeysOpinion;
