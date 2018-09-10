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

import xs from 'xstream';
import Stream from 'xstream';
import {Msg} from 'ssb-typescript';
const nest = require('depnest');

const publishHookOpinion = {
  gives: nest({
    'sbot.hook': ['publish', 'publishStream'],
  }),
  create: (api: any) => {
    const stream: Stream<Msg> = xs.create<any>();
    return nest({
      'sbot.hook': {
        publish: (msg: Msg) => {
          stream.shamefullySendNext(msg);
        },
        publishStream: () => stream,
      },
    });
  },
};

export default publishHookOpinion;
